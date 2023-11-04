"use client";
import Image from "next/image";
import { useState, useCallback } from "react";

export default function Home() {
  const [items, setItems] = useState<
    {
      weight: number;
      price: number;
    }[]
  >([
    {
      weight: 4,
      price: 7,
    },
    {
      weight: 6,
      price: 6,
    },
    {
      weight: 8,
      price: 9,
    },
  ]);

  const [ptr, setPtr] = useState<[number, number]>([0, 0]);
  const [curState, setCurState] = useState<number>(-1); // -1 = not initialized, 0 = ready, 1 = automatic running, 2 = iteration, 3 = finish

  const [dp, setDp] = useState<Array<Array<number | null>>>([]); // dp[item][capacity]
  const [color, setColor] = useState<Array<Array<string | null>>>([]);
  const [itemsColor, setItemsColor] = useState<Array<string | null>>([]);
  const [capacity, setCapacity] = useState<number>(14);
  const [delay, setDelay] = useState<number>(250);

  const [showColumns, setShowColumns] = useState<number[]>([]);
  const [toggleFlying, setToggleFlying] = useState<boolean>(false);
  // column would be the capacity
  // row would be the number of items

  const setAndResetColor = (
    colors: { row: number; col: number; color: string }[]
  ) => {
    let tempColor = JSON.parse(JSON.stringify(color));
    for (let i = 0; i < tempColor.length; i++) {
      for (let j = 0; j < tempColor[i].length; j++) {
        tempColor[i][j] = null;
      }
    }
    for (let i = 0; i < colors.length; i++) {
      tempColor[colors[i].row][colors[i].col] = colors[i].color;
    }
    setColor(tempColor);
  };

  const setAndResetItemsColor = (colors: { row: number; color: string }[]) => {
    let tempColor = JSON.parse(JSON.stringify(itemsColor));
    for (let i = 0; i < tempColor.length; i++) {
      tempColor[i] = null;
    }

    for (let i = 0; i < colors.length; i++) {
      tempColor[colors[i].row] = colors[i].color;
    }
    setItemsColor(tempColor);
  };

  const initializeDp = () => {
    const n = items.length;
    const c = capacity;

    // loop through the items
    // dp knapsack

    // initialize a (n+1) x (c+1) array
    let tempDp = Array<Array<number | null>>(n + 1);
    let tempColor = Array<Array<string | null>>(n + 1);
    let tempItemColor = Array<string | null>(items.length);

    for (let i = 0; i <= n; i++) {
      tempDp[i] = [];
      tempColor[i] = [];
      for (let j = 0; j <= c; j++) {
        tempDp[i].push(null);
        tempColor[i].push(null);
      }
    }

    for (let i = 0; i < items.length; i++) {
      tempItemColor[i] = null;
    }
    //console.log(tempDp);
    setPtr([0, 0]);
    setItemsColor(tempItemColor);
    setColor(tempColor);
    setDp(tempDp);
    setCurState(0);
    setShowColumns([]);
    //console.log(n, c);
  };

  const nextPtr = () => {
    const n = items.length;
    const c = capacity;

    let [i, j] = ptr;
    if (i == n && j == c) {
      setPtr([-1, -1]);
      setCurState(3);
      return;
    }
    if (j == c) {
      i++;
      j = 0;
    } else {
      j++;
    }
    setPtr([i, j]);
    if (i == -1) return;
    else if (i == 0) setShowColumns([i]);
    else setShowColumns([i - 1, i]);
  };

  const iterateSolution = async () => {
    setCurState(2);
    let tempDp = JSON.parse(JSON.stringify(dp));

    const [i, j] = ptr;

    if (i == 0 || j == 0) {
      setAndResetColor([{ row: i, col: j, color: "#9ca3af" }]);
      setAndResetItemsColor([]);

      tempDp[i][j] = 0;
    } else if (items[i - 1].weight <= j) {
      const takeItem: boolean =
        items[i - 1].price + tempDp[i][j - items[i - 1].weight] >
        tempDp[i - 1][j];
      setAndResetColor([
        { row: i, col: j, color: "#9ca3af" },
        {
          row: i,
          col: j - items[i - 1].weight,
          color: takeItem ? "#86efac" : "#b91c1c",
        },
        { row: i - 1, col: j, color: takeItem ? "#b91c1c" : "#86efac" },
      ]);
      setAndResetItemsColor([
        { row: i - 1, color: takeItem ? "#86efac" : "#b91c1c" },
      ]);

      tempDp[i][j] = Math.max(
        items[i - 1].price + tempDp[i][j - items[i - 1].weight],
        tempDp[i - 1][j]
      );
    } else {
      setAndResetItemsColor([{ row: i - 1, color: "#9ca3af" }]);
      setAndResetColor([
        { row: i, col: j, color: "#9ca3af" },
        { row: i - 1, col: j, color: "#86efac" },
      ]);

      tempDp[i][j] = tempDp[i - 1][j];
    }

    setDp(JSON.parse(JSON.stringify(tempDp)));
    nextPtr();
  };

  const solution = useCallback(async () => {
    if (curState !== 0) return;
    setCurState(1);
    const n = items.length;
    const c = capacity;

    let tempDp = JSON.parse(JSON.stringify(dp));

    for (let i = 0; i <= n; i++) {
      if (i > 0) setAndResetItemsColor([{ row: i - 1, color: "#9ca3af" }]);
      else setAndResetItemsColor([]);
      if (i == 0) setShowColumns([i]);
      else setShowColumns([i - 1, i]);
      for (let j = 0; j <= c; j++) {
        if (i == 0 || j == 0) {
          setAndResetColor([{ row: i, col: j, color: "#9ca3af" }]);

          tempDp[i][j] = 0;
        } else if (items[i - 1].weight <= j) {
          const takeItem: boolean =
            items[i - 1].price + tempDp[i][j - items[i - 1].weight] >
            tempDp[i - 1][j];
          setAndResetColor([
            { row: i, col: j, color: "#9ca3af" },
            {
              row: i,
              col: j - items[i - 1].weight,
              color: takeItem ? "#86efac" : "#b91c1c",
            },
            { row: i - 1, col: j, color: takeItem ? "#b91c1c" : "#86efac" },
          ]);
          setAndResetItemsColor([
            { row: i - 1, color: takeItem ? "#86efac" : "#b91c1c" },
          ]);

          tempDp[i][j] = Math.max(
            items[i - 1].price + tempDp[i][j - items[i - 1].weight],
            tempDp[i - 1][j]
          );
        } else {
          setAndResetItemsColor([{ row: i - 1, color: "#9ca3af" }]);
          setAndResetColor([
            { row: i, col: j, color: "#9ca3af" },
            { row: i - 1, col: j, color: "#86efac" },
          ]);

          tempDp[i][j] = tempDp[i - 1][j];
        }
        setDp(JSON.parse(JSON.stringify(tempDp)));
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    setCurState(3);
  }, [dp, items, capacity]);

  return (
    <main className="p-8 absolute">
      <h1 className="text-2xl font-bold underline">
        DP Knapsack Live Demonstration
      </h1>
      <br />
      <div>
        <table className="">
          <thead>
            <tr>
              <th className="border border-slate-500 w-12 bg-zinc-800"></th>
              {
                // loop through the capacity
                // add the capacity to the table header
                items.map((_, index) => {
                  return (
                    <th
                      key={index}
                      className="border border-slate-500 w-12 bg-zinc-800"
                    >
                      {index}
                    </th>
                  );
                })
              }
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-500 w-12 font-bold bg-zinc-800">
                w
              </td>
              {items.map((item, index) => {
                return (
                  <td
                    key={index}
                    className="border border-slate-500 w-12 bg-zinc-800"
                    style={{
                      backgroundColor: itemsColor[index] ?? "#000000",
                    }}
                  >
                    <input
                      className="bg-transparent w-12"
                      value={items[index].weight}
                      disabled={curState != -1}
                      onChange={(e) => {
                        const newVal = parseInt(e.target.value);

                        setItems([
                          ...items.slice(0, index),
                          {
                            weight: isNaN(newVal) ? 0 : newVal,
                            price: item.price,
                          },
                          ...items.slice(index + 1),
                        ]);
                      }}
                    ></input>
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="border border-slate-500 w-12 font-bold bg-zinc-800">
                p
              </td>
              {items.map((item, index) => {
                return (
                  <td
                    key={index}
                    className="border border-slate-500 w-12 disabled:opacity-50 bg-zinc-800"
                    style={{
                      backgroundColor: itemsColor[index] ?? "#000000",
                    }}
                  >
                    <input
                      className="bg-transparent w-12"
                      value={items[index].price}
                      disabled={curState != -1}
                      onChange={(e) => {
                        const newVal = parseInt(e.target.value);
                        setItems([
                          ...items.slice(0, index),
                          {
                            weight: item.weight,
                            price: isNaN(newVal) ? 0 : newVal,
                          },
                          ...items.slice(index + 1),
                        ]);
                      }}
                    ></input>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
        <div className="flex flex-row mt-6 gap-2">
          <button
            className="py-1 px-2 border border-slate rounded-lg bg-white text-black disabled:opacity-50 hover:bg-slate-300 active:bg-slate-400"
            onClick={() => {
              setItems([
                ...items,
                {
                  weight: 0,
                  price: 0,
                },
              ]);
            }}
            disabled={curState != -1}
          >
            Add Row
          </button>
          <button
            className="py-1 px-2 border border-slate rounded-lg bg-white text-black disabled:opacity-50 hover:bg-slate-300 active:bg-slate-400"
            onClick={() => {
              setItems(items.slice(0, items.length - 1));
            }}
            disabled={curState != -1}
          >
            Remove Row
          </button>
          <button
            className="py-1 px-2 border border-slate rounded-lg bg-white text-black disabled:opacity-50 hover:bg-slate-300 active:bg-slate-400"
            onClick={() => {
              setItems([]);
            }}
            disabled={curState != -1}
          >
            Clear All
          </button>
        </div>
      </div>
      <div className="mt-12 overflow-x-auto min-w-full">
        <table className="border border-slate-500 border-seperate ">
          <thead>
            <tr>
              <th className="border border-slate-500 w-12 font-bold bg-zinc-800"></th>
              {
                // loop through the capacity
                // add the capacity to the table header
                [...Array(capacity + 1)].map((_, index) => {
                  return (
                    <th
                      key={index}
                      className="border border-slate-500 w-12 bg-zinc-800"
                    >
                      {index}
                    </th>
                  );
                })
              }
            </tr>
          </thead>
          <tbody>
            {
              // loop through the data
              // first add the header column first to indicate the item number
              // then add the data
              dp.map((item, index_row) => {
                const cur = item;
                if (toggleFlying && !showColumns.includes(index_row))
                  return null;
                return (
                  <tr key={index_row}>
                    <td className="border border-slate-500 w-12 bg-zinc-800">
                      {toggleFlying
                        ? showColumns[0] == index_row
                          ? "prev"
                          : "cur"
                        : index_row}
                    </td>
                    {cur.map((item, index_col) => {
                      return (
                        <td
                          className="border border-slate-500 w-12"
                          key={index_col}
                          style={{
                            backgroundColor:
                              color?.[index_row]?.[index_col] ?? "#000000",
                          }}
                        >
                          {item}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
      <div className="flex flex-row gap-2 mt-6">
        <button
          className="py-1 px-2 border border-slate rounded-lg bg-white text-black disabled:opacity-50 hover:bg-slate-300 active:bg-slate-400"
          onClick={initializeDp}
          disabled={curState == 1 || curState == 2}
        >
          Initialize
        </button>
        <button
          className="py-1 px-2 border border-slate rounded-lg bg-white text-black disabled:opacity-50 hover:bg-slate-300 active:bg-slate-400"
          onClick={() => {
            setCurState(-1);
          }}
          disabled={curState == -1}
        >
          Change Settings
        </button>
        <button
          className="py-1 px-2 border border-slate rounded-lg bg-white text-black disabled:opacity-50 hover:bg-slate-300 active:bg-slate-400"
          onClick={solution}
          disabled={curState != 0}
        >
          Run
        </button>
        <button
          className="py-1 px-2 border border-slate rounded-lg bg-white text-black disabled:opacity-50 hover:bg-slate-300 active:bg-slate-400"
          onClick={() => {
            iterateSolution();
          }}
          disabled={curState != 0 && curState != 2}
        >
          Next
        </button>
        <button
          className="py-1 px-2 border border-slate rounded-lg bg-white text-black disabled:opacity-50 hover:bg-slate-300 active:bg-slate-400"
          onClick={() => {
            setToggleFlying(!toggleFlying);
          }}
          disabled={curState == -1}
          style={
            toggleFlying
              ? {
                  backgroundColor: "#d1fae5",
                }
              : {
                  backgroundColor: "#fee2e2",
                }
          }
        >
          Toggle 1D Array
        </button>
      </div>
      <div className="mt-6 flex flex-row gap-8">
        <div>
          <h1>Delay (ms)</h1>
          <input
            className="bg-transparent p-2 border-2 border-slate-800 rounded-lg w-24 disabled:opacity-50"
            placeholder="Delay value"
            value={delay}
            onChange={(e) => {
              const newVal = parseInt(e.target.value);
              setDelay(isNaN(newVal) ? 0 : newVal);
            }}
            disabled={curState != -1}
          />
        </div>
        <div>
          <h1>Capacity</h1>
          <input
            className="bg-transparent p-2 border-2 border-slate-800 rounded-lg w-24 disabled:opacity-50"
            placeholder="Capacity"
            value={capacity}
            onChange={(e) => {
              const newVal = parseInt(e.target.value);
              setCapacity(isNaN(newVal) ? 0 : newVal);
            }}
            disabled={curState != -1}
          />
        </div>
      </div>
      <div className="mt-20">
        <h1 className="font-bold text-xl">Legend</h1>
        <div className="mt-6 flex flex-row gap-4 h-6">
          <div className="bg-[#9ca3af] w-6 h-6 rounded-md" />
          <p>Current</p>
        </div>
        <div className="mt-2 flex flex-row gap-4 h-6">
          <div className="bg-[#86efac] w-6 h-6 rounded-md" />
          <p>Selected value(s)</p>
        </div>
        <div className="mt-2 flex flex-row gap-4 h-6">
          <div className="bg-[#b91c1c] h-6 h-6 aspect-square rounded-md" />
          <p>Unselected value(s)</p>
        </div>
      </div>
    </main>
  );
}
