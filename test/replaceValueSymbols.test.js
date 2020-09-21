const { replaceValueSymbols } = require("../src");

test("not change empty css", () => {
  expect(replaceValueSymbols("", {})).toEqual("");
});

test("not change unless there are translations", () => {
  expect(replaceValueSymbols("red", {})).toEqual("red");
});

test("change symbols within values", () => {
  expect(replaceValueSymbols("0 0 0 4px red", { red: "blue" })).toEqual(
    "0 0 0 4px blue"
  );
});

test("change multiple symbols within values", () => {
  expect(
    replaceValueSymbols("top left blur spread color", {
      top: "1px",
      left: "2px",
      blur: "3px",
      spread: "4px",
      color: "red",
    })
  ).toEqual("1px 2px 3px 4px red");
});

test("change complex symbols, if you feel like trolling yourself", () => {
  expect(
    replaceValueSymbols("1px 3px $sass-a", {
      "1px": "1rem",
      "3px": "$sass-b",
      "$sass-a": "4px",
    })
  ).toEqual("1rem $sass-b 4px");
});

test("rewrite custom properties", () => {
  expect(replaceValueSymbols("var(--red)", { "--red": "--blue" })).toEqual(
    "var(--blue)"
  );
});

test("not replace half a variable", () => {
  expect(
    replaceValueSymbols("colors red", {
      re: "green",
      color: "weights",
    })
  ).toEqual("colors red");
});

test("not replace a replacement", () => {
  expect(
    replaceValueSymbols("blue red", { red: "blue", blue: "green" })
  ).toEqual("green blue");
});

test("replace selectors identifiers contained . or #", () => {
  expect(
    replaceValueSymbols(".className #id", {
      className: "otherClassName",
      id: "otherId",
    })
  ).toEqual(".otherClassName #otherId");
});

test("not replace with values contained . or #", () => {
  expect(
    replaceValueSymbols(".className #id", {
      ".className": "otherClassName",
      "#id": "otherId",
    })
  ).toEqual(".className #id");
});
