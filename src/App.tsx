import React, { useState } from "react";

interface Comment {
  author: string;
  text: string;
  publishedAt: string;
}

const App = () => {
  const [url, setUrl] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const extractVideoId = (url: string) => {
    const match = url.match(/v=([^&]+)/);
    return match ? match[1] : "";
  };

  const handleFetchComments: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();
    const videoId = extractVideoId(url);
    if (!videoId) return alert("Invalid URL!");

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${import.meta.env.VITE_YT_API_KEY}&maxResults=50`
    );
    const data = await res.json();

    const fetchedComments: Comment[] = data.items.map((item: any) => ({
      author: item.snippet.topLevelComment.snippet.authorDisplayName,
      text: item.snippet.topLevelComment.snippet.textDisplay,
      publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
    }));

    setComments(fetchedComments);
    setSummary(""); // Reset summary before generating new one
  };

  const handleGenerateSummary = async () => {
    if (comments.length === 0) return alert("Fetch comments first!");

    setLoading(true);

    try {
      // Prepare text data to send
      const textData = comments.map((c) => c.text).join("\n");

      // POST request to OpenAI or other API for review summarization
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an assistant that summarizes YouTube comments for a Chrome extension review."
            },
            {
              role: "user",
              content: `Summarize the following comments in 3-4 concise sentences:\n\n${textData}`
            }
          ],
          max_tokens: 300
        }),
      });

      const data = await res.json();

      const generatedSummary = data?.choices?.[0]?.message?.content || "No summary available.";
      setSummary(generatedSummary);
    } catch (err) {
      console.error(err);
      alert("Error generating summary.");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">YouTube Comments Summarizer</h1>

      <input
        className="border p-2 w-full mb-4"
        placeholder="Paste YouTube video URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        onClick={handleFetchComments}
      >
        Fetch Comments
      </button>

      <button
        className="bg-green-500 text-white px-4 py-2 rounded"
        onClick={handleGenerateSummary}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Summary"}
      </button>

      {summary && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h2 className="font-bold mb-2">Summary:</h2>
          <p>{summary}</p>
        </div>
      )}

      <ul className="mt-4 space-y-2">
        {comments.map((c, i) => (
          <li key={c.publishedAt + i} className="border p-2 rounded">
            <div className="text-xs text-gray-500">{new Date(c.publishedAt).toLocaleString()}</div>
            <strong>{c.author}</strong>: {c.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
