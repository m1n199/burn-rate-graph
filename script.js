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
    },
  });
}

function CreateGraph() {
  if (!Graph) initGraph(), setStyleDisplay("block");
  const values = getValues();
  let [
    {
      MonthlyRevenue,
      MonthlyExpensive,
      GrowthRatePercentage,

      ExpensiveAdditionMonth,
      ExpensiveAdditionAmmount,

      ExpensiveReductionMonth,
      ExpensiveReductionRate,
    },
    BurnRateSatus,
  ] = values;
  GrowthRatePercentage /= 100;
  if (ExpensiveReductionRate) ExpensiveReductionRate /= 100;
  let ReduceExpence = () => {
    if (ExpensiveReductionRate) MonthlyExpensive *= 1 + ExpensiveReductionRate; // Reduce expence at specified Month
  };
  let IncreateExpence = () => {
    if (ExpensiveAdditionAmmount) MonthlyExpensive += ExpensiveAdditionAmmount; // Increase expence at specified Month
  };
  IncreateExpence();

  Month.forEach((_, i) => {
    if (ExpensiveReductionMonth && ExpensiveReductionMonth == i) ReduceExpence(); // For ExpensiveReduction
    if (ExpensiveAdditionMonth && ExpensiveAdditionMonth == i) IncreateExpence(); // For ExpensiveAddition
    // Basic
    BurnOutData[i] = MonthlyRevenue - MonthlyExpensive; 
    MonthlyRevenue *= 1 + GrowthRatePercentage; // Increate Revenue
  });

  // update graph
  Graph.data.datasets[0].label = `Burn Rate ${BurnOutData[BurnOutData.length - 1] > 0 ? "+ve" : "-ve"}`;
  Graph.data.datasets[0].data = BurnOutData;
  Graph.update();

  if (BurnOutData[BurnOutData.length - 1] && BurnOutData[BurnOutData.length - 1] > 0) BurnRateSatus("Burn Rate Positive !");
  else BurnRateSatus("Burn Rate Negative !");
}
document.querySelector("form button")?.addEventListener("click", CreateGraph);
  