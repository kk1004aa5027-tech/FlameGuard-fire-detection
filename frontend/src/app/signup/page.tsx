'use client'
import './signup.css'
import { useState } from 'react'

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // 🔽 여기가 바로 fetch + 에러 메시지 출력이 들어가는 부분!
  const handleSubmit = async e => {
    e.preventDefault()

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      alert('회원가입 성공!')
      window.location.href = '/login'
    } else {
      const contentType = res.headers.get('content-type')
      let errorMessage = '회원가입 실패!'

      if (contentType && contentType.includes('application/json')) {
        const err = await res.json()
        errorMessage += ' ' + err.detail
      } else {
        const errText = await res.text() // HTML, 텍스트 응답
        errorMessage += ' 서버 응답: ' + errText.slice(0, 100) // 처음 100자만
      }

      alert(errorMessage)
    }
  }

  return (
    <main className="signup-container">
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <label>이름</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label>이메일</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label>비밀번호</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <input type="submit" value="가입하기" />
        <a href="/login" className="back-button">
          로그인
        </a>
      </form>
    </main>
  )
}
