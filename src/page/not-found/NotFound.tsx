import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section>
      <h2>404 - Page Not Found</h2>
      <p>요청한 페이지를 찾을 수 없습니다.</p>
      <Link to="/home">홈으로 이동</Link>
    </section>
  )
}

export default NotFound
