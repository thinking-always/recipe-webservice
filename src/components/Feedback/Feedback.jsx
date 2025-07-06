import { useState } from "react";
import './Feedback.css';

export default function Feedback() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !message) {
      alert("이름과 피드백을 모두 작성해주세요!");
      return;
    }

    // 실제로는 서버로 보내야 함!
    console.log("Feedback submitted:", { name, message });
    setSubmitted(true);
  };

  return (
    <div className="feedback-container">
      <h1>📣 피드백 창</h1>
      <p>서비스에 대한 소중한 의견을 남겨주세요!</p>

      {submitted ? (
        <div className="feedback-success">
          <h3>✅ 감사합니다!</h3>
          <p>보내주신 피드백은 개발에 큰 도움이 됩니다 🙏</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="feedback-form">
          <label>
            이름
            <input
              type="text"
              value={name}
              placeholder="이름을 입력하세요"
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label>
            피드백
            <textarea
              value={message}
              placeholder="의견을 자유롭게 남겨주세요!"
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </label>

          <button type="submit">피드백 보내기</button>
        </form>
      )}
    </div>
  );
}
