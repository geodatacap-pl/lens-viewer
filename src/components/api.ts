
export const getNewestDetection = async (device_id: string) => {
    const data = await fetch(
        `http://127.0.0.1:8000/node/device-newest?device_id=${device_id}`,
        {
            method: "GET",
            headers: {
                "Content-type": "application/json",
            },
        },
    );

    return await data.json();
}

export const getDetectionData = async (device_id: string, start: string, end:string) => {
  const data = await fetch(
    `http://127.0.0.1:8000/node/device?device_id=${device_id}&start_date=${start}&end_date=${end}`,
    {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
    },
  );

  return await data.json();
};

export const getDetectionsIds = async () => {
  const data = await fetch("http://127.0.0.1:8000/node/device-list", {
    method: "GET",
    headers: {
      "Content-type": "application/json",
    },
  });

  return await data.json();
};
