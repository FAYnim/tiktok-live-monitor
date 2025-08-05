const socket = io();

const ctx = document.getElementById("chart").getContext("2d");
const chart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: ["Viewers", "Likes", "Comments", "Shares", "Gifts"],
    datasets: [{
      label: "Stats",
      data: [0, 0, 0, 0, 0],
      backgroundColor: ["#4caf50","#2962ff","#ff9800","#009688","#e91e63"]
    }]
  },
  options: { animation: false, responsive: true }
});

socket.on("stats", data => {
  chart.data.datasets[0].data = [
    data.viewers, data.likes, data.comments, data.shares, data.gifts
  ];
  chart.update();
});
