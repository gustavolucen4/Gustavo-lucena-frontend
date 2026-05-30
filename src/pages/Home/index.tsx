import { useEffect, useState} from "react";
import api from "../../services/api";
import { getAuthHeader, getUserId } from "../../services/auth";
import Feed from "../../components/Feed";
import MainScreen from "../../components/MainScreen";
import { Post } from "../../models/Post";
import { likePost } from "../../services/Posts";
import { useNavigate } from "react-router-dom";

function Home() {
    const userId = getUserId();
    const authHeader = getAuthHeader();
    const navigate = useNavigate();

    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {

        async function getPosts() {
            try {
                const { data } = await api.get("/post/followings", authHeader);
                setPosts(data);
            } catch (err: any) {
                if(err.response.status == 403){
                    navigate("/");
                }
                
            }
        }

        getPosts();
    }, [])

    function postCreated(post: Post) {
        setPosts((posts) => [post, ...posts])
    }

    async function handleLike(postId: string) {
        const [post] = posts.filter((post) => post.id === postId);

        try {
            let newPost: Post;
            if (post && !post.likes.includes(userId)) {
                newPost = await likePost(post, userId, false)
            }else {
                newPost = await likePost(post, userId, true)
            }

            setPosts((posts) => {
                const post = newPost;
                const index = posts.indexOf(post);
                posts[index] = newPost;
                return [...posts];
            })
        } catch (error) {
            alert("Erro ao dar like")
        }
    }

    return (
        <MainScreen postCreated={postCreated}>
            <Feed handleLike={handleLike} posts={posts} />
        </MainScreen>
    );
}

export default Home;