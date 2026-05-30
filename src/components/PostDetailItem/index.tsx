import { FormEvent, useEffect, useState } from 'react'
import { Post } from "../../models/Post";
import { likePost } from "../../services/Posts";
import { getAuthHeader, getUserId } from "../../services/auth";
import PostItem from "../PostItem";
import Text from "../Text";
import api from '../../services/api';
import { UserCircle } from '@phosphor-icons/react';
import { TextInput } from '../TextInput';
import { Button } from '../Button';
import { useNavigate } from 'react-router-dom';

interface PostDetailItemProps {
    post: Post;
    setPost: (post: Post) => void;
}

interface CommentFormElements extends HTMLFormControlsCollection {
    content: HTMLInputElement;
}

interface CommentFormElement extends HTMLFormElement {
    readonly elements: CommentFormElements;
}

interface CommentsProps {
    id: string;
    userEmail: string;
    content: string;
}

function PostDetailItem({ post, setPost }: PostDetailItemProps) {
    const [comments, setComments] = useState<CommentsProps[]>([])
    const userId = getUserId();
    const navigate = useNavigate();

    async function handleLike() {
        try {
            let newPost: Post;
            if (post && !post.likes.includes(userId)) {
                newPost = await likePost(post, userId, false)
            } else {
                newPost = await likePost(post, userId, true)
            }
            setPost({ ...newPost });

        } catch (error) {
            alert("Erro ao dar like")
        }
    }

    useEffect(() => {
        async function getComments() {
            try {
                const { data } = await api.get(`/comment/${post.id}`, getAuthHeader());
                setComments(data);
            } catch (error: any) {
                if(error.response.status == 403){
                    navigate("/");
                }else {
                    alert("Erro ao carregar comentários")
                }
            }
        }

        getComments();
    }, [])

    async function handleSaveComment(event: FormEvent<CommentFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;

        const data = {
            content: form.elements.content.value
        }

        try {
            const response = await api.post(`/comment/${post.id}`, data, getAuthHeader())
            setComments([response.data, ...comments])
            form.elements.content.value = "";
        } catch (error) {
            alert("Erro ao tentar salvar comentário")
        }
    }

    return (

        <div className="basis-5/6 flex flex-col w-full overflow-auto scroll-smooth">
            {post && (<PostItem post={post} handleLike={handleLike} />)}
            <form onSubmit={handleSaveComment} className='mx-8 my-8'>
                <Text className='text-white' >Insira seu comentário</Text>
                <TextInput.Root>
                    <TextInput.Input id='content' placeholder='Comente sobre este post...' />
                </TextInput.Root>
                <Button type='submit' className='mt-4'>
                    Adicionar comentário
                </Button>
            </form>
            <section className="border-t border-slate-400 w-full pt-2">
                <Text className="mx-8 font-extrabold text-white" >Comentários:</Text>
                <ul className='mx-8 mt-4'>
                    {comments && comments.map((comment: CommentsProps) => (
                        <li className='mb-8 border rounded-lg text-white p-2' key={comment.id}>
                            <div className='flex items-center gap-2'>
                                <UserCircle size={32} weight='light' className='text-slate-500' />
                                <Text className='text-white' size='sm'>{comment.userEmail}</Text>
                            </div>
                            <Text className='text-white'>{comment.content}</Text>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}

export default PostDetailItem;