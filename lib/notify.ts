const url = "https://api.pushover.net/1/messages.json";
const token = process.env.PUSHOVER_TOKEN || "";
const user = process.env.PUSHOVER_USER! || "";
const device = process.env.PUSHOVER_DEVICE || "";

async function notify({ title, message }: { title: string; message: string }) {
  const data = new URLSearchParams({
    token,
    user,
    device,
    title,
    message,
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: data,
  });

  if (!res.ok) {
    console.error(`Error sending message: ${res.status} ${res.statusText}`);
  }
}

export default notify;
