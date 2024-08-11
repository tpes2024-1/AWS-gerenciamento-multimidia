import React, { useState } from 'react';

function MediaManager() {
  const [action, setAction] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [mediaId, setMediaId] = useState('');
  const [query, setQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [allMedia, setAllMedia] = useState([]);
  const [filteredMedia, setFilteredMedia] = useState([]);

  const handleFileUpload = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
      setFile(reader.result);
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const handleCreate = () => {
    const newMedia = {
      id: Date.now(),
      type: mediaType,
      file: file,
      title: title,
      description: description,
      tags: tags.split(',').map(tag => tag.trim()),
      uploadDate: new Date().toISOString(),
    };

    localStorage.setItem(newMedia.id, JSON.stringify(newMedia));
    alert('Media uploaded successfully!');
  };

  const handleRead = () => {
    const media = JSON.parse(localStorage.getItem(mediaId));
    if (media) {
      setSelectedMedia([media]);
    } else {
      alert('Media not found!');
    }
  };

  const handleUpdate = () => {
    const media = JSON.parse(localStorage.getItem(mediaId));
    if (media) {
      media.title = title || media.title;
      media.description = description || media.description;
      media.tags = tags ? tags.split(',').map(tag => tag.trim()) : media.tags;

      localStorage.setItem(mediaId, JSON.stringify(media));
      alert('Media updated successfully!');
    } else {
      alert('Media not found!');
    }
  };

  const handleDelete = () => {
    localStorage.removeItem(mediaId);
    alert('Media deleted successfully!');
  };

  const handleSearch = () => {
    const allMedia = Object.keys(localStorage).map(key => {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch (e) {
        return null;
      }
    }).filter(media => media !== null);

    const filteredMedia = allMedia.filter(media => {
      const id = String(media.id) || '';
      const title = media.title || '';
      const description = media.description || '';
      const tags = media.tags || [];
      return (
        id.includes(query) ||
        title.includes(query) ||
        description.includes(query) ||
        tags.some(tag => tag.includes(query))
      );
    });

    setSelectedMedia(filteredMedia);
  };

  const handleListAll = () => {
    const allMedia = Object.keys(localStorage).map(key => {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch (e) {
        return null;
      }
    }).filter(media => media !== null);
    setAllMedia(allMedia);
  };

  const handleFilterByType = (type) => {
    const filtered = allMedia.filter(media => media.type === type);
    setFilteredMedia(filtered);
  };

  const handleSelectMedia = (id) => {
    const media = JSON.parse(localStorage.getItem(id));
    setSelectedMedia([media]);
  };

  const renderMediaContent = (media) => {
    const blob = dataURItoBlob(media.file);
    const url = URL.createObjectURL(blob);

    switch (media.type) {
      case 'image':
        return <img src={url} alt={media.title} />;
      case 'audio':
        return (
          <audio controls>
            <source src={url} type={media.fileType} />
            Your browser does not support the audio element.
          </audio>
        );
      case 'video':
        return (
          <video controls>
            <source src={url} type={media.fileType} />
            Your browser does not support the video element.
          </video>
        );
      default:
        return null;
    }
  };

  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  return (
    <div className="media-manager">
      <h1>Media Manager</h1>

      <select onChange={(e) => setAction(e.target.value)}>
        <option value="">Select Action</option>
        <option value="create">Create</option>
        <option value="read">Read</option>
        <option value="update">Update</option>
        <option value="delete">Delete</option>
        <option value="search">Search</option>
        <option value="list">List All</option>
      </select>

      {action === 'create' && (
        <div className="form">
          <h2>Create New Media</h2>
          <select onChange={(e) => setMediaType(e.target.value)}>
            <option value="">Select Media Type</option>
            <option value="image">Image</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
          </select>
          <input type="file" onChange={handleFileUpload} />
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <button onClick={handleCreate} className="submit-button">Upload</button>
        </div>
      )}

      {action === 'read' && (
        <div className="form">
          <h2>Read Media</h2>
          <input
            type="text"
            placeholder="Enter Media ID"
            value={mediaId}
            onChange={(e) => setMediaId(e.target.value)}
          />
          <button onClick={handleRead} className="submit-button">View</button>
          {selectedMedia && selectedMedia.map(media => (
            <div key={media.id} className="media-detail">
              <h3>{media.title} ({media.type})</h3>
              <p>Description: {media.description}</p>
              <p>Tags: {media.tags.join(', ')}</p>
              <p>Upload Date: {media.uploadDate}</p>
              <p>ID: {media.id}</p>
              {renderMediaContent(media)}
            </div>
          ))}
        </div>
      )}

      {action === 'update' && (
        <div className="form">
          <h2>Update Media</h2>
          <input
            type="text"
            placeholder="Enter Media ID"
            value={mediaId}
            onChange={(e) => setMediaId(e.target.value)}
          />
          <input
            type="text"
            placeholder="New Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="New Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <textarea
            placeholder="New Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button onClick={handleUpdate} className="submit-button">Update</button>
        </div>
      )}

      {action === 'delete' && (
        <div className="form">
          <h2>Delete Media</h2>
          <input
            type="text"
            placeholder="Enter Media ID"
            value={mediaId}
            onChange={(e) => setMediaId(e.target.value)}
          />
          <button onClick={handleDelete} className="submit-button">Delete</button>
        </div>
      )}

      {action === 'search' && (
        <div className="form">
          <h2>Search Media</h2>
          <input
            type="text"
            placeholder="Enter Search Query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={handleSearch} className="submit-button">Search</button>
          {selectedMedia && selectedMedia.map(media => (
            media.id ? <div key={media.id} className="media-detail">
            <h3>{media.title} ({media.type})</h3>
            <p>Description: {media.description}</p>
            <p>Tags: {media.tags.join(', ')}</p>
            <p>Upload Date: {media.uploadDate}</p>
            <p>ID: {media.id}</p>
          </div>:null
            
          ))}
        </div>
      )}

      {action === 'list' && (
        <div className="form media-list">
          <h2>All Media</h2>
          <button onClick={handleListAll} className="submit-button">List All</button>
          <button onClick={() => handleFilterByType('image')} className="submit-button">Filter Images</button>
          <button onClick={() => handleFilterByType('audio')} className="submit-button">Filter Audio</button>
          <button onClick={() => handleFilterByType('video')} className="submit-button">Filter Videos</button>
          {filteredMedia.length > 0 ? (
            filteredMedia.map(media => (
              media.id ?  <div key={media.id} className="media-item" onClick={() => handleSelectMedia(media.id)}>
              <p>ID: {media.id}</p>
              <p>Title: {media.title}</p>
            </div> : null
            
            ))
          ) : (
            allMedia.map(media => (
              media.id ?  <div key={media.id} className="media-item" onClick={() => handleSelectMedia(media.id)}>
              <p>ID: {media.id}</p>
              <p>Title: {media.title}</p>
            </div>: null
             
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default MediaManager;
