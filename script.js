// ▼ Cloudflare Workersで発行されたURLを設定してください
const WORKER_URL = "https://your-worker-subdomain.workers.dev";

document.getElementById("recruitForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "送信中...";

  const formData = {
    rpName: document.getElementById("rpName").value.trim(),
    discordId: document.getElementById("discordId").value.trim(),
    experience: document.getElementById("experience").value,
    activeTime: document.getElementById("activeTime").value.trim(),
    pr: document.getElementById("pr").value.trim()
  };

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (response.ok && result.success) {
      alert("応募が完了しました！担当者からのDiscord連絡をお待ちください。");
      document.getElementById("recruitForm").reset();
    } else {
      alert("送信に失敗しました。");
    }
  } catch (error) {
    console.error("送信エラー:", error);
    alert("通信エラーが発生しました。");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "応募内容を送信する";
  }
});