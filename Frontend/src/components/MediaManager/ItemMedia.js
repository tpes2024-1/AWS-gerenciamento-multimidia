import { useState } from "react"
import moment from 'moment'
import Trash from '../../assets/imgs/x.svg'
export default ({ media, deleteHandle }) => {
    const [showMore, setShowMore] = useState(false)

    return (
        <div style={{ cursor: 'pointer', position: 'relative' }} key={media.id} className="media-item" onClick={() => { setShowMore(!showMore) }}>
            <p>ID: {media.id}</p>
            <p>Descrição: {media.description}</p>
            {showMore && <>
                <p>Tags: {media.tag}</p>
                <p>Data: {moment(media.uploaded_at).format("DD/MM/YYYY hh:mm:ss")}</p>

                {media.mime_type.startsWith('image/') && (
                    <img src={media.file_visualization} alt={media.description} style={{ maxWidth: '100%', height: 'auto' }} />
                )}

                {media.mime_type.startsWith('video/') && (
                    <video controls style={{ maxWidth: '100%', height: 'auto' }}>
                        <source src={media.file_visualization} type={media.mime_type} />
                        Seu navegador não suporta o elemento de vídeo.
                    </video>
                )}

                {media.mime_type.startsWith('audio/') && (
                    <audio controls>
                        <source src={media.file_visualization} type={media.mime_type} />
                        Seu navegador não suporta o elemento de áudio.
                    </audio>
                )}
            </>
            }


            <button onClick={(ev) => {
                ev.stopPropagation()
                deleteHandle(media)
            }} style={{
                background: 'red',
                position: 'absolute',
                width: 25,
                height: 25,
                border: 'none',
                borderRadius: 7,
                top: 10,
                right: 10,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>

                <img alt='logout' src={Trash} style={{ width: '85%', margin: '0px auto', textAlign: 'center' }} />
            </button>


        </div>
    )
}