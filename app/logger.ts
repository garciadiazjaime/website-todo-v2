export const loggerInfo = async (message: string, payload: unknown) => {
  console.log(message);

  await fetch("https://s1610512.eu-nbg-2.betterstackdata.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LOGTAIL_TOKEN}`,
    },
    body: JSON.stringify({
      dt: new Date().toISOString(),
      message: message,
      payload: JSON.stringify(payload),
    }),
  });
};
