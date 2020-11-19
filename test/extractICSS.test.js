const postcss = require("postcss");
const { extractICSS } = require("../src");

const runExtract = (input, mode) =>
  extractICSS(postcss.parse(input), true, mode);
const runCSS = (input, removeRules, mode) => {
  const css = postcss.parse(input);
  extractICSS(css, removeRules, mode);
  return css.toString();
};

test("extract import statements with identifier", () => {
  const expected = {
    icssImports: {
      "col.ors-2": {},
    },
    icssExports: {},
  };
  expect(runExtract(":import(col.ors-2) {}")).toEqual(expected);
  expect(runExtract("@icss-import col.ors-2 {}")).toEqual(expected);
});

test("extract import statements with single quoted path", () => {
  const expected = {
    icssImports: {
      "./colors.css": {},
    },
    icssExports: {},
  };
  expect(runExtract(`:import('./colors.css') {}`)).toEqual(expected);
  expect(runExtract(`@icss-import './colors.css'`)).toEqual(expected);
});

test("extract import with values", () => {
  const expected = {
    icssImports: {
      "./colors.css": {
        i__blue: "blue",
        i__red: "red",
      },
    },
    icssExports: {},
  };

  expect(
    runExtract(":import(./colors.css) { i__blue: blue; i__red: red; }")
  ).toEqual(expected);

  expect(
    runExtract("@icss-import ./colors.css { i__blue: blue; i__red: red; }")
  ).toEqual(expected);
});

test("extract :import statements manually created in postcss", () => {
  const root = postcss.parse("");
  root.append(
    postcss
      .rule({ selector: ":import(./colors.css)" })
      .append(postcss.decl({ prop: "i__blue", value: "blue" }))
      .append(postcss.decl({ prop: "i__red", value: "red" }))
  );
  expect(extractICSS(root)).toEqual({
    icssImports: {
      "./colors.css": {
        i__blue: "blue",
        i__red: "red",
      },
    },
    icssExports: {},
  });
});
test("extract @icss-import statements manually created in postcss", () => {
  const root = postcss.parse("");
  root.append(
    postcss
      .atRule({ name: "icss-import", params: "./colors.css" })
      .append(postcss.decl({ prop: "i__blue", value: "blue" }))
      .append(postcss.decl({ prop: "i__red", value: "red" }))
  );
  expect(extractICSS(root)).toEqual({
    icssImports: {
      "./colors.css": {
        i__blue: "blue",
        i__red: "red",
      },
    },
    icssExports: {},
  });
});

test("not extract invalid import", () => {
  expect(runExtract(":import(\\'./colors.css) {}")).toEqual({
    icssImports: {},
    icssExports: {},
  });

  expect(runExtract("@icss-import \\'./colors.css {}")).toEqual({
    icssImports: {},
    icssExports: {},
  });
});

test("extract export", () => {
  const expected = {
    icssImports: {},
    icssExports: {
      blue: "i__blue",
      red: "i__red",
    },
  };

  expect(runExtract(":export { blue: i__blue; red: i__red }")).toEqual(
    expected
  );
  expect(runExtract("@icss-export { blue: i__blue; red: i__red }")).toEqual(
    expected
  );
});

test("remove import after extracting", () => {
  expect(runCSS(":import(colors) {} .foo {}")).toEqual(".foo {}");
  expect(runCSS("@icss-import(colors) {} .foo {}")).toEqual(".foo {}");
});

test("remove export after extracting", () => {
  expect(runCSS(":export {} @media {}")).toEqual("@media {}");
  expect(runCSS("@icss-export {} @media {}")).toEqual("@media {}");
});

test("extract properties with underscore", () => {
  expect(runExtract(":import(colors) {_a: b} :export { _c: d}")).toEqual({
    icssImports: {
      colors: {
        _a: "b",
      },
    },
    icssExports: {
      _c: "d",
    },
  });
});

test("not remove rules from ast with removeRules=false", () => {
  const fixture = ":import(colors) {_a: b} :export {_c: d} .foo {}";
  expect(runCSS(fixture, false)).toEqual(fixture);
});

test("not process at-rules when mode is pseudo", () => {
  expect(
    runExtract(
      `
        :import(colors) {_a: b}
        @icss-import("./other/colors") {_a: b}

        :export {_c: d}
        @icss-export { d: d}

      `,
      "rule"
    )
  ).toEqual({
    icssImports: {
      colors: {
        _a: "b",
      },
    },
    icssExports: {
      _c: "d",
    },
  });
});

test("not process at-rules when mode is 'at-rule'", () => {
  expect(
    runExtract(
      `
        :import(colors) {_a: b}
        @icss-import "./other/colors" {_a: b}

        :export {_c: d}
        @icss-export { d: d}

      `,
      "at-rule"
    )
  ).toEqual({
    icssImports: {
      "./other/colors": {
        _a: "b",
      },
    },
    icssExports: {
      d: "d",
    },
  });
});
