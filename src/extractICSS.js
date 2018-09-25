const importPattern = /^:import\(("[^"]*"|'[^']*')(?:\s(.+))?\)$/;

const getDeclsObject = rule => {
  const object = {};
  rule.walkDecls(decl => {
    object[decl.raws.before.trim() + decl.prop] = decl.value;
  });
  return object;
};

const extractICSS = (css, removeRules = true) => {
  const icssImports = {};
  const icssExports = {};
  css.each(node => {
    if (node.type === "rule") {
      if (node.selector.slice(0, 7) === ":import") {
        const matches = importPattern.exec(node.selector);
        if (matches) {
          const path = matches[1].replace(/'|"/g, "");
          const extra = matches[2] ? matches[2] : "";
          const dep = `"${path}"${extra ? ` ${extra}` : ""}`;
          icssImports[dep] = Object.assign(icssImports[dep] || {}, {
            path,
            ...(extra ? { extra } : {}),
            tokens: Object.assign(
              icssImports[dep] ? icssImports[dep].tokens : {},
              getDeclsObject(node)
            )
          });
          if (removeRules) {
            node.remove();
          }
        }
      }
      if (node.selector === ":export") {
        Object.assign(icssExports, getDeclsObject(node));
        if (removeRules) {
          node.remove();
        }
      }
    }
  });
  return { icssImports, icssExports };
};

export default extractICSS;
