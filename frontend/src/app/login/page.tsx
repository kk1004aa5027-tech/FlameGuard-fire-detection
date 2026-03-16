'use client'
import './login.css'
import { useState } from 'react'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleLogin = async e => {
    e.preventDefault()

    const res = await fetch('/api/login', {
      // ✅ 경로 수정
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      const data = await res.json()
      document.cookie = `user_id=${data.user_id}; path=/;`
      alert('로그인 성공!')
      window.location.href = '/mainboard'
    } else {
      alert('로그인 실패!')
    }
  }

  return (
    <main className="login-container">
      <h2>로그인</h2>
      <form onSubmit={handleLogin}>
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

        <input type="submit" value="로그인" />
        <a href="/signup" className="back-button">
          회원가입
        </a>
      </form>
    </main>
  )
}
