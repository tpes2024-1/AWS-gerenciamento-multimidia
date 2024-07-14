import config from '../../config.js'
import { useEffect, useState } from 'react';
import instance from '../../api.js'
function Posts({ postsData, activeScroll = true }) {

    const [posts, setPost] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [page, setPage] = useState(2);

    // Função para lidar com o evento de scroll
    const handleScroll = (event) => {
        if (event.target.scrollTop + event.target.clientHeight >= event.target.scrollHeight - 100 && !isFetching) {
            setIsFetching(() => true);

            instance.get("/posts/user/?limit=20&page=" + page, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('token')
                }
            })
                .then((response) => {
                    var array = posts
                    for (const key in response.data) {
                        array.push(response.data[key])
                    }
                    setPage(prevPage => prevPage + 1); // Usando a função de atualização do estado para obter o valor mais recente de 'page'
                    if (response.data.length === 0) return
                    setIsFetching(() => false);
                    setPost(() => array);
                })
        }
    }

    useEffect(() => {
        setIsFetching(!activeScroll)
        setPost(postsData)
    }, []);
    return (
        <div style={{ position: 'relative', top: 0, overflow: 'auto', height: 'calc(100vh - 166px)' }} onScroll={handleScroll} >
            {posts.length > 0 && posts.map((post, index) => (
                <div key={index} className='DashPhoto'>
                    <img src={config.baseURL + "/files/photos/" + post.photo.path} alt="img" className="ImagePost" />
                    <span>{post.description}</span>
                </div>
            ))}
        </div>

    );
}

export default Posts;