'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Post {
  id: number
  title: string
  content: string
}

export default function ManagePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    fetchPosts()

    // ✅ Supabase v2 Realtime
    const channel = supabase
      .channel('posts-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        payload => {
          setPosts(prev => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('id', { ascending: true })

    setPosts(data || [])
  }

  const addPost = async () => {
    if (!title || !content) return
    await supabase.from('posts').insert({ title, content })
    setTitle('')
    setContent('')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Posts</h1>

      {/* Add Post */}
      <div className="mb-6">
        <input
          className="border p-2 w-full mb-2"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          className="border p-2 w-full mb-2"
          placeholder="Content"
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={addPost}
        >
          Add Post
        </button>
      </div>

      {/* List Posts */}
      <div className="space-y-3">
        {posts.map(post => (
          <div key={post.id} className="border p-3 rounded bg-white">
            <h2 className="font-semibold">{post.title}</h2>
            <p>{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
