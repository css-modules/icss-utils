import postcss from "postcss";
import { extractICSS } from "../src";

const runExtract = input => extractICSS(postcss.parse(input));
const runCSS = (input, removeRules) => {
  const css = postcss.parse(input);
  extractICSS(css, removeRules);
  return css.toString();
};

test("extract :import statements with single quoted path", () => {
  expect(runExtract(`:import('./colors.css') {}`)).toEqual({
    icssImports: {
      '"./colors.css"': {
        path: "./colors.css",
        tokens: {}
      }
    },
    icssExports: {}
  });
});

test("extract :import statements with double quoted path", () => {
  expect(runExtract(':import("./colors.css") {}')).toEqual({
    icssImports: {
      '"./colors.css"': {
        path: "./colors.css",
        tokens: {}
      }
    },
    icssExports: {}
  });
});

test("extract :import statements with space in path", () => {
  expect(runExtract(`:import('./col ors.css') {}`)).toEqual({
    icssImports: {
      '"./col ors.css"': {
        path: "./col ors.css",
        tokens: {}
      }
    },
    icssExports: {}
  });
});

test("extract :import statements with extra", () => {
  expect(
    runExtract(':import("./colors.css" screen and (orientation:landscape)) {}')
  ).toEqual({
    icssImports: {
      '"./colors.css" screen and (orientation:landscape)': {
        path: "./colors.css",
        extra: "screen and (orientation:landscape)",
        tokens: {}
      }
    },
    icssExports: {}
  });
});

test("extract :import statements with space in path and extra", () => {
  expect(
    runExtract(':import("./col ors.css" screen and (orientation:landscape)) {}')
  ).toEqual({
    icssImports: {
      '"./col ors.css" screen and (orientation:landscape)': {
        path: "./col ors.css",
        extra: "screen and (orientation:landscape)",
        tokens: {}
      }
    },
    icssExports: {}
  });
});

test("extract multiple :import statements with same paths", () => {
  expect(
    runExtract(':import("./colors.css") {} :import("./colors.css") {}')
  ).toEqual({
    icssImports: {
      '"./colors.css"': {
        path: "./colors.css",
        tokens: {}
      }
    },
    icssExports: {}
  });
});

test("extract multiple :import statements with same paths and difference quotes", () => {
  expect(
    runExtract(":import(\"./colors.css\") {} :import('./colors.css') {}")
  ).toEqual({
    icssImports: {
      '"./colors.css"': {
        path: "./colors.css",
        tokens: {}
      }
    },
    icssExports: {}
  });
});

test("extract multiple :import statements with same paths and same extras", () => {
  expect(
    runExtract(
      ':import("./colors.css" screen and (orientation:landscape)) {} :import("./colors.css" screen and (orientation:landscape)) {}'
    )
  ).toEqual({
    icssImports: {
      '"./colors.css" screen and (orientation:landscape)': {
        path: "./colors.css",
        extra: "screen and (orientation:landscape)",
        tokens: {}
      }
    },
    icssExports: {}
  });
});

test("extract multiple :import statements with same paths and difference extras", () => {
  expect(
    runExtract(
      ':import("./colors.css" screen and (orientation:portrait)) {} :import("./colors.css" screen and (orientation:landscape)) {}'
    )
  ).toEqual({
    icssImports: {
      '"./colors.css" screen and (orientation:portrait)': {
        path: "./colors.css",
        extra: "screen and (orientation:portrait)",
        tokens: {}
      },
      '"./colors.css" screen and (orientation:landscape)': {
        path: "./colors.css",
        extra: "screen and (orientation:landscape)",
        tokens: {}
      }
    },
    icssExports: {}
  });
});

test("extract multiple :import statements with same paths, difference quotes and same extras", () => {
  expect(
    runExtract(
      ":import(\"./colors.css\" screen and (orientation:landscape)) {} :import('./colors.css' screen and (orientation:landscape)) {}"
    )
  ).toEqual({
    icssImports: {
      '"./colors.css" screen and (orientation:landscape)': {
        path: "./colors.css",
        extra: "screen and (orientation:landscape)",
        tokens: {}
      }
    },
    icssExports: {}
  });
});

test("extract multiple :import statements with difference paths", () => {
  expect(
    runExtract(':import("./colors.css") {} :import("./other.css") {}')
  ).toEqual({
    icssImports: {
      '"./colors.css"': {
        path: "./colors.css",
        tokens: {}
      },
      '"./other.css"': {
        path: "./other.css",
        tokens: {}
      }
    },
    icssExports: {}
  });
});

test("extract multiple :import statements with difference paths and same extras", () => {
  expect(
    runExtract(
      ':import("./colors.css" screen and (orientation:landscape)) {} :import("./other.css" screen and (orientation:landscape)) {}'
    )
  ).toEqual({
    icssImports: {
      '"./colors.css" screen and (orientation:landscape)': {
        path: "./colors.css",
        extra: "screen and (orientation:landscape)",
        tokens: {}
      },
      '"./other.css" screen and (orientation:landscape)': {
        path: "./other.css",
        extra: "screen and (orientation:landscape)",
        tokens: {}
      }
    },
    icssExports: {}
  });
});

test("extract multiple :import statements with difference paths and difference extras", () => {
  expect(
    runExtract(
      ':import("./colors.css" screen and (orientation:portrait)) {} :import("./other.css" screen and (orientation:landscape)) {}'
    )
  ).toEqual({
    icssImports: {
      '"./colors.css" screen and (orientation:portrait)': {
        path: "./colors.css",
        extra: "screen and (orientation:portrait)",
        tokens: {}
      },
      '"./other.css" screen and (orientation:landscape)': {
        path: "./other.css",
        extra: "screen and (orientation:landscape)",
        tokens: {}
      }
    },
    icssExports: {}
  });
});

test("extract :import with values", () => {
  expect(
    runExtract(':import("./colors.css") { i__blue: blue; i__red: red; }')
  ).toEqual({
    icssImports: {
      '"./colors.css"': {
        path: "./colors.css",
        tokens: {
          i__blue: "blue",
          i__red: "red"
        }
      }
    },
    icssExports: {}
  });
});

test("extract :import with values and extra", () => {
  expect(
    runExtract(
      ':import("./colors.css" screen and (orientation:landscape)) { i__blue: blue; i__red: red; }'
    )
  ).toEqual({
    icssImports: {
      '"./colors.css" screen and (orientation:landscape)': {
        path: "./colors.css",
        extra: "screen and (orientation:landscape)",
        tokens: {
          i__blue: "blue",
          i__red: "red"
        }
      }
    },
    icssExports: {}
  });
});

test("extract multiple :import with same paths and difference values", () => {
  expect(
    runExtract(
      ':import("./colors.css") { i__blue: blue; i__red: red; } :import("./colors.css") { i__white: white; i__black: black; }'
    )
  ).toEqual({
    icssImports: {
      '"./colors.css"': {
        path: "./colors.css",
        tokens: {
          i__white: "white",
          i__blue: "blue",
          i__red: "red",
          i__black: "black"
        }
      }
    },
    icssExports: {}
  });
});

test("extract multiple :import with same paths and same values", () => {
  expect(
    runExtract(
      ':import("./colors.css") { i__blue: blue; i__red: red; } :import("./colors.css") { i__blue: blue; i__red: red; }'
    )
  ).toEqual({
    icssImports: {
      '"./colors.css"': {
        path: "./colors.css",
        tokens: {
          i__blue: "blue",
          i__red: "red"
        }
      }
    },
    icssExports: {}
  });
});

test("extract multiple :import with same paths and additional value", () => {
  expect(
    runExtract(
      ':import("./colors.css") { i__blue: blue; i__red: red; } :import("./colors.css") { i__blue: blue; i__red: red; i__yellow: yellow; }'
    )
  ).toEqual({
    icssImports: {
      '"./colors.css"': {
        path: "./colors.css",
        tokens: {
          i__blue: "blue",
          i__red: "red",
          i__yellow: "yellow"
        }
      }
    },
    icssExports: {}
  });
});

test("extract multiple :import with difference paths and difference values", () => {
  expect(
    runExtract(
      ':import("./colors.css") { i__blue: blue; i__red: red; } :import("./other.css") { i__white: white; i__black: black; }'
    )
  ).toEqual({
    icssImports: {
      '"./colors.css"': {
        path: "./colors.css",
        tokens: {
          i__blue: "blue",
          i__red: "red"
        }
      },
      '"./other.css"': {
        path: "./other.css",
        tokens: {
          i__white: "white",
          i__black: "black"
        }
      }
    },
    icssExports: {}
  });
});

test("not extract :import statements with identifier", () => {
  expect(runExtract(":import(col.ors-2) {}")).toEqual({
    icssImports: {},
    icssExports: {}
  });
});

test("not extract invalid :import", () => {
  expect(runExtract(":import(\\'./colors.css) {}")).toEqual({
    icssImports: {},
    icssExports: {}
  });
});

test("extract :export", () => {
  expect(runExtract(":export { blue: i__blue; red: i__red }")).toEqual({
    icssImports: {},
    icssExports: {
      blue: "i__blue",
      red: "i__red"
    }
  });
});

test("extract multiple :export", () => {
  expect(
    runExtract(
      ":export { blue: i__blue; red: i__red } :export { white: i__white; black: i__black }"
    )
  ).toEqual({
    icssImports: {},
    icssExports: {
      black: "i__black",
      blue: "i__blue",
      red: "i__red",
      white: "i__white"
    }
  });
});

test("remove :import after extracting", () => {
  expect(runCSS(':import("colors") {} .foo {}')).toEqual(".foo {}");
});

test("remove :export after extracting", () => {
  expect(runCSS(":export {} @media {}")).toEqual("@media {}");
});

test("extract properties with underscore", () => {
  expect(runExtract(':import("colors.css") {_a: b} :export { _c: d}')).toEqual({
    icssImports: {
      '"colors.css"': {
        path: "colors.css",
        tokens: {
          _a: "b"
        }
      }
    },
    icssExports: {
      _c: "d"
    }
  });
});

test("not remove rules from ast with removeRules=false", () => {
  const fixture = ":import('colors') {_a: b} :export {_c: d} .foo {}";
  expect(runCSS(fixture, false)).toEqual(fixture);
});

test("remove rules from ast with removeRules=false", () => {
  const fixture = ":import('colors') {_a: b} :export {_c: d} .foo {}";
  expect(runCSS(fixture, true)).toEqual(".foo {}");
});
