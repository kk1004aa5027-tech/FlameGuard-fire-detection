'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import './write.css'

export default function WritePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [img, setImg] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const cookies = document.cookie.split('; ').reduce((acc, curr) => {
      const [key, value] = curr.split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)
    const user_id = cookies.user_id

    if (!user_id) {
      alert('로그인 후 이용해주세요!')
      return
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('content', content)
    formData.append('user_id', user_id)
    if (img) formData.append('img', img)

    const res = await fetch('http://localhost:8000/api/board/create', {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      router.push('/board') // 성공 후 게시판으로 이동
    } else {
      alert('업로드 실패!')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: '600px', margin: '2rem auto' }}
    >
      <h1 className="board-title">글쓰기</h1>
      <input
        type="text"
        placeholder="제목"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
      />
      <textarea
        placeholder="내용"
        value={content}
        onChange={e => setContent(e.target.value)}
        required
        style={{
          width: '100%',
          padding: '0.5rem',
          height: '150px',
          marginBottom: '1rem',
        }}
      />
      <input
        type="file"
        accept="image/*"
        onChange={e => setImg(e.target.files?.[0] || null)}
        style={{ marginBottom: '1rem' }}
      />
      <button type="submit" style={{ padding: '0.75rem 1.5rem' }}>
        등록
      </button>
    </form>
  )
}
