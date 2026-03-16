'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import './board.css'

type Post = {
  board_id: number
  title: string
  content: string
  created_at: string
  img?: string
  user?: {
    name: string
  }
}

export default function BoardPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const router = useRouter()

  useEffect(() => {
    fetch('http://localhost:8000/api/board/list')
      .then(res => res.json())
      .then(data => {
        console.log('게시글 목록:', data)
        setPosts(data)
      })
  }, [])

  return (
    <main className="board-container">
      <div className="board-buttons">
        <button
          className="board-button"
          onClick={() => router.push('/mainboard')}
        >
          메인보드
        </button>
        <button className="board-button" onClick={() => router.push('/write')}>
          글쓰기
        </button>
      </div>

      <h1 className="board-title">게시판</h1>
      {posts.length === 0 ? (
        <p>게시글이 없습니다.</p>
      ) : (
        <ul className="board-list">
          {posts.map(post => (
            <li key={post.board_id} className="board-item">
              <h2>{post.title}</h2>
              <p>{post.content}</p>
              {post.img && (
                <img
                  src={`http://localhost:8000${post.img}`}
                  alt="게시글 이미지"
                  style={{
                    maxWidth: '100%',
                    marginTop: '1rem',
                    borderRadius: '8px',
                  }}
                />
              )}
              <small>
  작성자: {post.user?.name ?? '알 수 없음'} | 작성일: {new Date(post.created_at).toLocaleString()}
</small>

            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
