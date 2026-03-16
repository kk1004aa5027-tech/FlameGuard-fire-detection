'use client'
import './mainboard.css'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Post {
  board_id: number
  title: string
  created_at: string
  author_name: string
}

interface AlarmItem {
  message: string
  created_at: string
  result_image?: string
}

export default function Mainboard() {
  const router = useRouter()
  const [recentPosts, setRecentPosts] = useState<Post[]>([])
  const [userName, setUserName] = useState<string | null>(null)
  const [alarms, setAlarms] = useState<AlarmItem[]>([])
  useEffect(() => {
    const cookies = document.cookie.split('; ').reduce((acc, curr) => {
      const [key, value] = curr.split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)

    if (!cookies.user_id) {
      router.push('/login') // ❗ 로그인 안 한 경우 리다이렉트
    } else {
      setUserName(cookies.name || '사용자')
    }

    fetch('/api/board/recent')
      .then(res => res.json())
      .then(data => setRecentPosts(data))
    fetch('/api/alarm/latest')
      .then(res => res.json())
      .then(data => setAlarms(data))
  }, [])

  function logout() {
    document.cookie = 'user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    window.location.href = '/login'
  }

  if (!userName) {
    return <div>로딩 중...</div> // 쿠키 파악 전까지는 잠깐 로딩 상태
  }
  return (
    <main className="mainboard-container">
      <h1>화재감지 시스템 메인보드</h1>
      <div className="header-right">
        <span>{userName}님</span>
        <button onClick={logout} className="logout-button">
          [로그아웃]
        </button>
      </div>

      <div className="container">
        <section className="section">
          <h2 className="section-h2">알림</h2>
          <ol style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {alarms.map((item, index) => (
              <li key={index}>
                [{item.message}] ({item.created_at})
              </li>
            ))}
          </ol>

          <div className="button-group">
            <span className="show-button" onClick={() => router.push('/alarm')}>
              전체보기
            </span>
          </div>
        </section>

        <section className="section">
          <h2 className="section-h2">게시판</h2>
          <ul>
            {recentPosts.map(post => (
              <li key={post.board_id}>
                <strong>{post.title}</strong> - {post.author_name} (
                {new Date(post.created_at).toLocaleString()})
              </li>
            ))}
          </ul>
          <div className="button-group">
            <span className="show-button" onClick={() => router.push('/board')}>
              전체보기
            </span>
            <span className="show-button" onClick={() => router.push('/write')}>
              글쓰기
            </span>
          </div>
        </section>
      </div>
    </main>
  )
}
