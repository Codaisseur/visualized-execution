import React, { useState } from "react";
import cx from "classnames";
import styles from "./Viz.module.scss";

export default function Viz({
  step: { node, context, pre, summary, detail },
  showBuiltins,
  escapeAnalysis = false
}) {
  return (
    <div>
      <p>
        <em>{summary}</em>
      </p>
      <div className={styles.split}>
        <div className={styles.col}>
          <Scope
            context={context}
            scopeRef={0}
            current={context.currentScope}
            showBuiltins={showBuiltins}
            escapeAnalysis={escapeAnalysis}
          />
        </div>
        <div className={styles.col}>
          {context.objects.map((obj, i) => {
            const show = showBuiltins || !obj.builtin;
            return show ? (
              <div key={i} style={{ marginBottom: ".4rem" }}>
                <div>
                  object #{i} - {obj.type}
                </div>
                <Obj obj={obj} />
              </div>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
}

function Obj({ obj }) {
  const [showBody, set_showBody] = useState(true);

  return (
    <div className={styles.obj}>
      {/* {obj.type === "array" && (
        <>
          {Object.values(obj.elements).map((value, i) => (
            <div key={i} className={styles.item}>
              <span className={styles.kind}>item</span> <Value value={value} />
            </div>
          ))}
        </>
      )} */}
      {obj.type === "function" && (
        <>
          <div className={styles.item}>
            <span
              className={styles.kind}
              style={{ cursor: "pointer" }}
              onClick={() => set_showBody(!showBody)}
            >
              {showBody ? "hide" : "show"} body
            </span>{" "}
            {showBody && (
              <pre
                style={{
                  margin: "0 0 0 .4rem",
                  display: "inline-block",
                  verticalAlign: "text-top"
                }}
              >
                {obj.source}
              </pre>
            )}
          </div>
        </>
      )}
      {Object.values(obj.properties || {}).map((v, i) => (
        <Var key={i} v={v} />
      ))}
    </div>
  );
}

function Scope({
  context,
  scopeRef,
  current,
  showBuiltins,
  escapeAnalysis = false
}) {
  const scope = context.scopes[scopeRef];
  const isCurrent = current === scopeRef;
  const vars = Object.values(scope.variables);

  const show = showBuiltins || !scope._builtin;

  const shownVars = show
    ? vars.filter(v => showBuiltins || v.kind !== "builtin")
    : [];

  if (shownVars.length === 0 && scope.children.length === 0) return null;
  if (escapeAnalysis && scope.freed) return null;

  const className =
    shownVars.length === 0 && !show
      ? ""
      : cx({ [styles.scope]: true, [styles.isCurrent]: isCurrent });

  return (
    <div className={className}>
      {shownVars.map((v, i) => (
        <Var key={i} v={v} />
      ))}
      {scope.children.map(childRef => (
        <div key={childRef}>
          <Scope
            context={context}
            scopeRef={childRef}
            current={current}
            showBuiltins={showBuiltins}
            escapeAnalysis={escapeAnalysis}
          />
        </div>
      ))}
    </div>
  );
}

function Var({ v: { kind, name, value } }) {
  return (
    <div className={styles.var}>
      <span className={styles.kind}>{kind}</span> {name}{" "}
      {value !== undefined && (
        <span>
          {kind === "return" ? `` : `= `}
          <Value value={value} />
        </span>
      )}
    </div>
  );
}

function Value({ value }) {
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "object" && "object_ref" in value)
    return `object #${value.object_ref}`;
  if (typeof value === "boolean") return `${value}`;
  if (typeof value === "object") {
    console.log("object value???", value);
    return "???";
  }
  return value;
}
