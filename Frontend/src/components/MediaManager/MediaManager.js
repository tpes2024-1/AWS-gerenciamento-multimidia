import React, { useState } from 'react';
import Menu from '../../components/menu/Menu.js'
import instance from '../../api.js';
import ItemMedia from './ItemMedia.js';

function MediaManager() {
  const [action, setAction] = useState('create');
  const [mediaType, setMediaType] = useState('image');
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');

  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  const [mediaId, setMediaId] = useState('');
  const [mediaTypeUpdate, setMediaTypUpdate] = useState('image');
  const [fileUpdate, setFileUpdate] = useState(null);
  const [descriptionUpdate, setDescriptionUpdate] = useState('');
  const [tagsUpdate, setTagsUpdate] = useState('');

  const [queryMedias, setQueryMedias] = useState([]);
  const [queryDescription, setQueryDescription] = useState('');
  const [queryTag, setQueryTag] = useState('');
  const [queryNomeArquivo, setQueryNomeArquivo] = useState('');

  const [allMedia, setAllMedia] = useState({
    all: []
  });
  const [filteredMedia, setFilteredMedia] = useState(null);

  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCreate = async () => {

    if (file === null || description === '') {
      alert("Arquivo ou descrição inválidos")
      return
    }
    var url = ''
    const formData = new FormData();
    formData.append('description', description);
    formData.append('tag', tags);

    if (mediaType === 'image') {
      formData.append('image', file);
      url = '/images'
    }

    if (mediaType === 'audio') {
      formData.append('audio', file);
      url = '/audios'
    }

    if (mediaType === 'video') {
      formData.append('video', file);
      url = '/videos'
    }


    await instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': 'bearer ' + localStorage.getItem("token")
      },
    }).then((response) => {
      setTitle('')
      setDescription('')
      setTags('')
      setFile(null)
      alert('Sucesso no Upload!');
    }).catch((error) => {
      console.log(error.response.data)
    })

  };

  const deleteHandle = async (media) => {
    var url = ''
    if (media.mime_type.startsWith('image/')) {
      url = 'images/' + media.id
    }
    if (media.mime_type.startsWith('video/')) {
      url = 'videos/' + media.id
    }
    if (media.mime_type.startsWith('audio/')) {
      url = 'audios/' + media.id
    }

    await instance.delete(url, {
      headers: {
        'Content-Type': "application/json",
        'Authorization': 'bearer ' + localStorage.getItem("token")
      },
    }).then((response) => {

      handleListAll()

    }).catch((error) => {
      console.log(error.response.data)
    })

  };

  const handleUpdate = async () => {

    if (mediaId === '') {
      alert('Indique um ID')
      return
    }

    if (mediaTypeUpdate === 'image') {
      if (fileUpdate === null && descriptionUpdate === '' && tagsUpdate === '') {
        alert('Nenhum dado para ser atualizado')
        return
      }
      const formData = new FormData();

      if (fileUpdate !== null) {
        formData.append('file', fileUpdate);
      }
      if (descriptionUpdate !== '') {
        formData.append('description', descriptionUpdate);
      }
      if (tagsUpdate !== '') {
        formData.append('tag', tagsUpdate);
      }

      await instance.put('/images/' + mediaId, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'bearer ' + localStorage.getItem("token")
        },
      }).then((response) => {
        console.log(response.data)
        setDescriptionUpdate('')
        setTagsUpdate('')
        setFileUpdate(null)
        alert('Update feito com sucesso');

      }).catch((error) => {
        alert(error.response.data.detail);
      })
    }

  };

  const handleSearch = async () => {
    await instance.get("/files/?description=" + queryDescription + "&tag=" + queryTag + "&file_name=" + queryNomeArquivo, {
      headers: {
        'Content-Type': "application/json",
        'Authorization': 'bearer ' + localStorage.getItem("token")
      },
    }).then((response) => {
      var value = []

      if (response.data.audios !== undefined) {
        value = value.concat(response.data.audios)
      }
      if (response.data.videos !== undefined) {
        value = value.concat(response.data.videos)
      }
      if (response.data.images !== undefined) {
        value = value.concat(response.data.images)
      }

      setQueryMedias(value)

    }).catch((error) => {
      console.log(error.response.data)
    })

  };

  const handleListAll = async () => {
    setAllMedia({
      all:[]
    });

    setFilteredMedia(null);

    await instance.get('/files', {
      headers: {
        'Content-Type': "application/json",
        'Authorization': 'bearer ' + localStorage.getItem("token")
      },
    }).then((response) => {
      var value = response.data
      value.all = response.data.audios.concat(response.data.images)
      value.all = value.all.concat(response.data.videos)

      setAllMedia(value);

    }).catch((error) => {
      console.log(error.response.data)
    })

  };

  const handleFilterByType = async (type) => {
    setFilteredMedia(null);
    setAllMedia({
      all:[]
    });

    await instance.get('/files', {
      headers: {
        'Content-Type': "application/json",
        'Authorization': 'bearer ' + localStorage.getItem("token")
      },
    }).then((response) => {
      setFilteredMedia(response.data[type]);
    }).catch((error) => {
      console.log(error.response.data)
    })

  };

  const mediaTypes = {
    image: ['image/jpeg', 'image/png', 'image/gif'],
    video: ['video/mp4', 'video/avi'],
    audio: ['audio/mpeg', 'audio/wav','audio/m4a','audio/mp3']
  };
  return (
    <div className="media-manager">
      <h1>Gerenciar Mídias</h1>
      <Menu />

      <select onChange={(e) => setAction(e.target.value)}>
        <option selected value="create">Upload</option>
        <option value="update">Update</option>
        <option value="search">Procurar</option>
        <option value="list">Listar Todas</option>
      </select>

      {action === 'create' && (
        <div className="form" style={{ gap: 10 }}>
          <h2>Upload</h2>
          <select onChange={(e) => setMediaType(e.target.value)}>
            <option value="image">Imagem</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
          </select>
          <input type="file" onChange={handleFileUpload} accept={mediaType ? mediaTypes[mediaType].join(',') : '*/*'} disabled={!mediaType}
          />

          <textarea
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="text"
            placeholder="Tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <button onClick={handleCreate} className="submit-button">Upload</button>
        </div>
      )}

      {action === 'update' && (
        <div style={{ gap: 10 }} className="form">
          <h2>Update Mídia</h2>

          <select onChange={(e) => setMediaTypUpdate(e.target.value)}>
            <option value="image">Imagem</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
          </select>

          <input type="file" onChange={(e) => {
            setFileUpdate(e.target.files[0]);
          }} accept={mediaTypeUpdate ? mediaTypes[mediaTypeUpdate].join(',') : '*/*'} disabled={!mediaTypeUpdate} />

          <input
            type="text"
            placeholder="Entre com o ID"
            value={mediaId}
            onChange={(e) => setMediaId(e.target.value)}
          />

          <input
            type="text"
            placeholder="Descrição"
            value={descriptionUpdate}
            onChange={(e) => setDescriptionUpdate(e.target.value)}
          />
          <textarea
            placeholder="Tags"
            value={tagsUpdate}
            onChange={(e) => setTagsUpdate(e.target.value)}
          />
          <button onClick={handleUpdate} className="submit-button">Update</button>

        </div>
      )}

      {action === 'search' && (
        <div style={{ gap: 10 }} className="form">
          <h2>Procurar Mídia</h2>

          <input
            type="text"
            placeholder="Descrição"
            value={queryDescription}
            onChange={(e) => setQueryDescription(e.target.value)}
          />
          <input
            type="text"
            placeholder="Tag"
            value={queryTag}
            onChange={(e) => setQueryTag(e.target.value)}
          />
          <input
            type="text"
            placeholder="Nome do arquivo"
            value={queryNomeArquivo}
            onChange={(e) => setQueryNomeArquivo(e.target.value)}
          />

          <button onClick={handleSearch} className="submit-button">Pesquisar</button>

          {
            queryMedias.map(media => (
              <ItemMedia media={media} deleteHandle={deleteHandle} />
            ))
          }

        </div>
      )}

      {action === 'list' && (
        <div className="form media-list">
          <h2>Todas as Mídias</h2>
          <button onClick={handleListAll} className="submit-button">Listar Todas</button>
          <button onClick={() => handleFilterByType('images')} className="submit-button">Filtro - Imagens</button>
          <button onClick={() => handleFilterByType('audios')} className="submit-button">Filtro - Audios</button>
          <button onClick={() => handleFilterByType('videos')} className="submit-button">Filtro - Videos</button>
          {filteredMedia != null ? (
            filteredMedia.map(media => (
              <ItemMedia media={media} deleteHandle={deleteHandle} />
            ))
          ) : (
            allMedia.all.map(media => (
              <ItemMedia media={media} deleteHandle={deleteHandle} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default MediaManager;
