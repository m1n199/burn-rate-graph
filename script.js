const Month = ["Jan", "Feb", "March", "April", "May", "Jun","July", "Aug", "Sep", "Oct", "Nov", "Dec"];
const BurnOutData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let Graph = null;

// fetch values of all input
function getValues() {
  const inputs = document.querySelectorAll('input[type="number"]');
  const selects = document.querySelectorAll("select");
  let values = {};

  inputs.forEach((input) => {
    const value = parseFloat(input.value.replace(/\s/g, ""));
    if (!isNaN(value)) values[input.id] = value;
  });

  selects.forEach((select) => {
    if (`${select.id}`.endsWith("Month") && (select.value == -1 || select.value == "-1")) return;
    values[select.id] = parseFloat(select.value);
  });

  return [
    values,
    (value) => {
      const BurnStatus = document.getElementById("BurnStatus");
      if (!BurnStatus) return;
      BurnStatus.textContent = value;
    }
  ];
}

// extra input style handler
const setStyleDisplay = (d) => document.querySelectorAll("[data-burn-rate]").forEach((e) => (e.style.display = d)); 
setStyleDisplay("none");
const BalanceData = {}, RunawayData = {};
function initGraph() {
  const ctx = document.getElementById("BurnRateChart").getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, "#00C2AC"); // Light green at the bottom
  gradient.addColorStop(1, "#C9EBE9"); // Dark green at the top

  Graph = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Month,
      datasets: [
        {
          label: `Burn Rate`,
          data: [],
          borderWidth: 1,
          backgroundColor: gradient,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#00C2AC" },
          grid: { color: "#C9EBE9" },
          border: { width: 2, color: "#00C2AC" },
        },
        x: {
          ticks: { color: "#00C2AC" },
          grid: { color: "#C9EBE9" },
          border: {
            width: 2,
            color: "#00C2AC",
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            footer: (tooltipItems) => {
              const m = tooltipItems[0].label;
              if (!m) return;
              let B = BalanceData[m], R = RunawayData[m];
              return `Balance: ${B ? parseFloat(B).toFixed(2) : ""
                } \n Runaway: ${R ? parseFloat(R).toFixed(2) : ""
                }`;
            },
          },
        },
      },
    },
  });
}

function CreateGraph() {
  if (!Graph) initGraph(), setStyleDisplay("block");
  const values = getValues();
  let [
    {
      CurrentBalance,
      MonthlyRevenue,
      MonthlyExpensive,
      GrowthRatePercentage,

      ExpensiveAdditionMonth,
      ExpensiveAdditionAmmount,

      ExpensiveReductionMonth,
      ExpensiveReductionRate,
    },
    BurnRateSatus,
  ] = values, Runaway;
  GrowthRatePercentage /= 100;
  if (ExpensiveReductionRate) ExpensiveReductionRate /= 100; 
  let ReduceExpence = () => {
    MonthlyExpensive -= MonthlyExpensive * ExpensiveReductionRate; // Reduce expence at specified Month
  };
  let IncreateExpence = () => {
    if (ExpensiveAdditionAmmount) MonthlyExpensive += ExpensiveAdditionAmmount; // Increase expence at specified Month
  };
  // IncreateExpence();
  Month.forEach((m, i) => {
    if (ExpensiveReductionMonth && ExpensiveReductionMonth == i) ReduceExpence(); // For ExpensiveAddition
    if (ExpensiveAdditionMonth && ExpensiveAdditionMonth == i) IncreateExpence(); // Basic
    
    BurnOutData[i] = MonthlyRevenue - MonthlyExpensive;
    CurrentBalance += BurnOutData[i];

    Runaway = CurrentBalance / MonthlyExpensive;
    BalanceData[m] = CurrentBalance; RunawayData[m] = Runaway;

    MonthlyRevenue += MonthlyRevenue * GrowthRatePercentage; // Increate Revenue
  });

  Graph.data.datasets[0].data = BurnOutData; Graph.update();

  if (BurnOutData[BurnOutData.length - 1] && BurnOutData[BurnOutData.length - 1] > 0) BurnRateSatus("Your Burn Rate is Positive !");
  else BurnRateSatus("Your Burn Rate is Negative !");
}
document.querySelector("form button")?.addEventListener("click", CreateGraph);
  