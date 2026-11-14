// ▼ Cloudflare Workersで発行されたURLを設定してください
const WORKER_URL = "https://sho-ryu-custom-v1.pages.dev/";

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

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    try {
      const data = await request.json();

      // Discord送信用ペイロードの組み立て
      const discordPayload = {
        username: "Sho Ryo Custom 採用窓口",
        embeds: [
          {
            title: "🛠️ 新しいメカニック応募が届きました！",
            color: 15965202, // オレンジ色
            fields: [
              { name: "住民名", value: data.rpName || "未入力", inline: true },
              { name: "Discord ID", value: data.discordId || "未入力", inline: true },
              { name: "メカニック経験", value: data.experience || "未入力", inline: true },
              { name: "主な活動時間帯", value: data.activeTime || "未入力", inline: false },
              { name: "志望動機・自己PR", value: data.pr || "未入力", inline: false }
            ],
            footer: { text: "Sho Ryo Custom Web採用システム" },
            timestamp: new Date().toISOString()
          }
        ]
      };

      // Cloudflareの環境変数からDiscord Webhook URLを取得して送信
      const discordResponse = await fetch(env.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discordPayload)
      });

      if (!discordResponse.ok) {
        const errorText = await discordResponse.text();
        throw new Error(`Discord API Error: ${errorText}`);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });

    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
  }
};
