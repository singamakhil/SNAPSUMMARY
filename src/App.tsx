import React, { useState } from "react";
interface Comment {
  author : string;
  text : string;
  publishedAt: string;  

}


const App = () => {

  const [url, setUrl] =useState('');
  const [comments , setComments] = useState<Comment[]>([]);

  const extractVideoId = (url: string) => { const match = url.match(/v=([^&]+)/); return match ? match[1] : ''; };

  const handleSubmit : React.MouseEventHandler<HTMLButtonElement> = async (e) => {

    const videoId = extractVideoId(url)
    if(!videoId) {
      return alert("invaild url!")
    }
    e.preventDefault()

    const res = await fetch(`https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${ import.meta.env.VITE_YT_API_KEY }&maxResults=50`);
    const data = await res.json();

    const fetchedComments : Comment = data.items.map((item: any) => ({ author: item.snippet.topLevelComment.snippet.authorDisplayName, text: item.snippet.topLevelComment.snippet.textDisplay, publishedAt: item.snippet.topLevelComment.snippet.publishedAt }));

    setComments(fetchedComments);
  }



  return(
  <>
  <div>
  <label>Enter Youtube url</label>
  <input value={url} onChange={e => setUrl(e.target.value)}/>
    <button onClick={handleSubmit}>Fetch comments</button>
  </div>
  <ul>

    {comments && comments.map((c) =>(
      <li key={c.publishedAt}>
        <div>{new Date(c.publishedAt).toLocaleString()}</div>
        <strong>{c.author}</strong> {c.text}
      </li>
    ))}
  </ul>
  </>
  )
}

export default App;