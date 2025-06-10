import React, { useState } from "react";
import { Box, Button, FormControl, TextField, Typography } from "@mui/material";

const RapidCalculations: React.FC = () => {
  const [num, setNum] = useState<string>("321");
  const [error, setError] = useState<string>("");
  const [ots, setOts] = useState<Record<string, string[]>>();

  const onNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNum(e.target.value);
    setError("");
  };

  const getOutcomes = (x: string, y: string) => {
    const outcomes: string[] = [];

    const a = Number.isInteger(Number(x)) ? x : `(${x})`;
    const b = y;

    const ops = [`${a} + ${b}`, `${a} - ${b}`, `${a} * ${b}`, `${a} / ${b}`];

    ops.forEach((op) => {
      const r = eval(op);

      if (Number.isInteger(r) && r > 0) {
        outcomes.push(op);
      }
    });

    return outcomes;
  };

  const getAllCombinations = (x: string, y: string, z: string) => {
    const combination: Record<string, string[]> = {};

    combination[`${x}-${y}-${z}`] = [x, y, z];
    combination[`${x}-${z}-${y}`] = [x, z, y];

    combination[`${y}-${x}-${z}`] = [y, x, z];
    combination[`${y}-${z}-${x}`] = [y, z, x];

    combination[`${z}-${x}-${y}`] = [z, x, y];
    combination[`${z}-${y}-${x}`] = [z, y, x];

    return Object.values(combination);
  };

  const getAllOperations = (
    x: string,
    y: string,
    z: string
  ): Record<string, string[]> => {
    const combinations = getAllCombinations(x, y, z);
    const results: Record<string, string[]> = {};

    combinations.forEach(([a, b, c]) => {
      const o2 = getOutcomes(a, b);

      if (o2.length > 0) {
        o2.forEach((o) => {
          const o3 = getOutcomes(o, c);

          o3.forEach((r) => {
            const sol = eval(r);
            results[`${sol}`] = results[`${sol}`]
              ? [...results[`${sol}`], r]
              : [r];
          });
        });
      }
    });

    return results;
  };

  const calculateOutcomes = () => {
    setOts(undefined);
    const n = Number(num);

    if (!isNaN(n) && n > 110 && n < 667) {
      const n = num.split("");
      const results = getAllOperations(n[0], n[1], n[2]);

      if (Object.keys(results).length > 0) {
        setOts(results);
      } else {
        setError("No outcomes found");
      }
    } else {
      setError("Invalid Number");
    }
  };

  const showOutcomeDisplay = () => {
    const list: React.ReactNode[] = [];

    if (ots) {
      const keys = Object.keys(ots);

      list.push(
        keys.map((k) => (
          <Typography variant="h5" component="span" sx={{ mx: 2 }}>
            {k}
          </Typography>
        ))
      );

      keys.forEach((o) => {
        ots[o].forEach((r) => {
          console.log(r);
          list.push(
            <Typography
              component="section"
              key={r}
              sx={{ my: 1, display: "block", width: "70%" }}
            >
              {o} = {r}
            </Typography>
          );
        });
      });
    }

    return list;
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <FormControl variant="filled" fullWidth>
          <TextField value={num} onChange={onNumChange} label="Enter Number" />
        </FormControl>

        <Button variant="outlined" sx={{ mx: 2 }} onClick={calculateOutcomes}>
          Calculate
        </Button>
      </Box>

      {error && (
        <Typography variant="body2" color="error">
          ⚠️ {error}
        </Typography>
      )}

      {ots && (
        <Box sx={{ my: 3, flexWrap: "wrap", display: "flex" }}>
          {showOutcomeDisplay()}
        </Box>
      )}
    </>
  );
};

export default RapidCalculations;
