/* ═══ 器械铺 · 万用工具墙 —— 逻辑层 ═══ */
"use strict";

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* 错误捕获（供验证脚本检查） */
window.addEventListener("error", (e) => {
  const d = $("#errSink");
  d.textContent += "ERR:" + e.message + ";";
});

/* ═══ 时钟 ═══ */
function tick() {
  const n = new Date();
  const t = [n.getHours(), n.getMinutes(), n.getSeconds()].map((x) => String(x).padStart(2, "0")).join(":");
  $("#clock").textContent = t;
  $("#stClock").textContent = t + " · 器械铺 · 营业中";
}
tick(); setInterval(tick, 1000);

/* ═══ 工具注册表 ═══ */
const TOOLS = [];
const reg = (id, ico, name, tag, desc, mount) => TOOLS.push({ id, ico, name, tag, desc, mount });

/* ── 01 单位换算 ── */
const UNITS = {
  长度: { 米: 1, 千米: 1000, 厘米: .01, 毫米: .001, 英尺: .3048, 英寸: .0254, 英里: 1609.344, 市尺: 1 / 3 },
  重量: { 千克: 1, 克: .001, 吨: 1000, 磅: .45359237, 盎司: .028349523, 市斤: .5 },
  面积: { 平方米: 1, 平方千米: 1e6, 公顷: 1e4, 亩: 666.6667, 平方英尺: .09290304 },
  体积: { 升: 1, 毫升: .001, 立方米: 1000, 加仑: 3.785412 },
  数据: { 字节: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776 },
};
reg("unit", "m", "单位换算", "五类", "长度 / 重量 / 面积 / 体积 / 数据量，输一个数即时换算整张表", (el) => {
  el.innerHTML =
    '<div class="row"><span class="lab">类别</span><select id="uCat">' + Object.keys(UNITS).map((k) => "<option>" + k + "</option>").join("") + '</select>' +
    '<span class="lab" style="min-width:auto">数值</span><input type="number" id="uVal" value="1" step="any" style="width:110px">' +
    '<span class="lab" style="min-width:auto">单位</span><select id="uFrom"></select></div>' +
    '<div class="out" id="uOut"></div>';
  const cat = $("#uCat"), from = $("#uFrom"), val = $("#uVal"), out = $("#uOut");
  function fillFrom() {
    from.innerHTML = Object.keys(UNITS[cat.value]).map((u) => "<option>" + u + "</option>").join("");
    calc();
  }
  function calc() {
    const U = UNITS[cat.value];
    const v = parseFloat(val.value);
    if (isNaN(v)) { out.innerHTML = "输入一个数值试试。"; return; }
    const base = v * U[from.value];
    out.innerHTML = "<b>" + esc(v + " " + from.value) + "</b> = " +
      Object.entries(U).map(([u, f]) => esc(u) + " " + (base / f).toPrecision(8).replace(/\.?0+$/, "")).join("　｜　");
  }
  cat.addEventListener("change", fillFrom);
  from.addEventListener("change", calc);
  val.addEventListener("input", calc);
  fillFrom();
});

/* ── 02 颜色转换 ── */
function hex2rgb(h) {
  h = h.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) {
    if (mx === r) h = ((g - b) / d) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
  }
  const l = (mx + mn) / 2;
  const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}
reg("color", "RGB", "颜色转换", "HEX/HSL", "输入 HEX 色号，RGB / HSL / 亮度一并给出，还可调三滑杆", (el) => {
  el.innerHTML =
    '<div class="grid2"><div>' +
    '<div class="row"><span class="lab">HEX</span><input type="text" id="cHex" value="#3f7bd9" style="width:120px">' +
    '<button class="btn ghost" id="cRnd">随机一色</button></div>' +
    '<div class="row">R <input type="range" id="cR" min="0" max="255" value="63" style="flex:1">' +
    '<span id="cRv" style="font-family:var(--mono);width:34px">63</span></div>' +
    '<div class="row">G <input type="range" id="cG" min="0" max="255" value="123" style="flex:1">' +
    '<span id="cGv" style="font-family:var(--mono);width:34px">123</span></div>' +
    '<div class="row">B <input type="range" id="cB" min="0" max="255" value="217" style="flex:1">' +
    '<span id="cBv" style="font-family:var(--mono);width:34px">217</span></div>' +
    '</div><div>' +
    '<div class="swatch" id="cSw"><span id="cSwT">#3F7BD9</span></div>' +
    '<div class="out" id="cOut"></div>' +
    '</div></div>';
  const hx = $("#cHex");
  function render() {
    const rgb = hex2rgb(hx.value);
    if (!rgb) { $("#cOut").innerHTML = "色号格式不对，形如 #3F7BD9。"; return; }
    const [r, g, b] = rgb;
    $("#cR").value = r; $("#cG").value = g; $("#cB").value = b;
    $("#cRv").textContent = r; $("#cGv").textContent = g; $("#cBv").textContent = b;
    const hex = "#" + rgb.map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase();
    const [h, s, l] = rgb2hsl(r, g, b);
    const lum = Math.round((0.2126 * r + 0.7152 * g + 0.0722 * b));
    $("#cSw").style.background = hex;
    $("#cSwT").textContent = hex + "　亮度 " + lum + (lum > 140 ? "（深字浅底）" : "（浅字深底）");
    $("#cOut").innerHTML =
      "HEX <b>" + hex + "</b><br>RGB <b>rgb(" + r + ", " + g + ", " + b + ")</b><br>" +
      "HSL <b>hsl(" + h + ", " + s + "%, " + l + "%)</b><br>" +
      "CMYK 近似 <b>" + (function () {
        const k = 1 - Math.max(r, g, b) / 255;
        if (k === 1) return "0, 0, 0, 100%";
        const c = (1 - r / 255 - k) / (1 - k), m = (1 - g / 255 - k) / (1 - k), y = (1 - b / 255 - k) / (1 - k);
        return [c, m, y].map((x) => Math.round(x * 100)) + "%, " + Math.round(k * 100) + "%";
      })() + "</b>";
  }
  hx.addEventListener("input", render);
  $("#cRnd").addEventListener("click", () => {
    hx.value = "#" + Array.from({ length: 6 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
    render();
  });
  [["#cR", "#cRv"], ["#cG", "#cGv"], ["#cB", "#cBv"]].forEach(([sid, vid]) => {
    $(sid).addEventListener("input", () => {
      $(vid).textContent = $(sid).value;
      hx.value = "#" + [$("#cR").value, $("#cG").value, $("#cB").value]
        .map((x) => (+x).toString(16).padStart(2, "0")).join("");
      render();
    });
  });
  render();
});

/* ── 03 时间戳转换 ── */
function fmtDate(d) {
  const p = (x) => String(x).padStart(2, "0");
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " +
    p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
}
reg("ts", "⏱", "时间戳转换", "Unix", "秒级 / 毫秒级时间戳与日期互转，一键取当下", (el) => {
  el.innerHTML =
    '<div class="row"><span class="lab">时间戳</span><input type="text" id="tIn" style="width:200px" placeholder="如 1770000000">' +
    '<button class="btn" id="tNow">取当下</button><button class="btn ghost" id="tGo">换算</button></div>' +
    '<div class="out" id="tOut1"></div>' +
    '<div class="row" style="margin-top:14px"><span class="lab">日期</span><input type="text" id="tDate" style="width:220px" placeholder="如 2026-09-22 12:00:00">' +
    '<button class="btn" id="tGo2">反查时间戳</button></div>' +
    '<div class="out" id="tOut2"></div>';
  function go() {
    const raw = $("#tIn").value.trim();
    const out = $("#tOut1");
    let n = Number(raw);
    if (!raw || isNaN(n)) { out.innerHTML = "输入数字时间戳（10 位秒级或 13 位毫秒级）。"; return; }
    if (Math.abs(n) < 1e12) n *= 1000;
    const d = new Date(n);
    if (isNaN(d.getTime())) { out.innerHTML = "超出可表示范围。"; return; }
    out.innerHTML = "本地时间 <b>" + fmtDate(d) + "</b><br>UTC <b>" + d.toUTCString() + "</b><br>" +
      "星期<b>" + "日一二三四五六"[d.getDay()] + "</b>　当年第 <b>" +
      Math.ceil((d - new Date(d.getFullYear(), 0, 1)) / 864e5) + "</b> 天";
    $("#tDate").value = fmtDate(d);
  }
  function go2() {
    const s = $("#tDate").value.trim();
    const d = new Date(s.replace(/-/g, "/"));
    const out = $("#tOut2");
    if (isNaN(d.getTime())) { out.innerHTML = "日期格式：2026-09-22 12:00:00"; return; }
    out.innerHTML = "秒级 <b>" + Math.floor(d.getTime() / 1000) + "</b>　毫秒级 <b>" + d.getTime() + "</b>";
  }
  $("#tGo").addEventListener("click", go);
  $("#tNow").addEventListener("click", () => { $("#tIn").value = Math.floor(Date.now() / 1000); go(); });
  $("#tGo2").addEventListener("click", go2);
  $("#tIn").value = Math.floor(Date.now() / 1000); go();
});

/* ── 04 密码生成 ── */
reg("pwd", "***", "密码生成", "强度计", "按位长与字符集生成密码，实时熵值估强度", (el) => {
  el.innerHTML =
    '<div class="row"><span class="lab">位长</span><input type="range" id="pLen" min="6" max="32" value="16" style="flex:1">' +
    '<b id="pLenV" style="font-family:var(--mono)">16</b></div>' +
    '<div class="row"><label><input type="checkbox" id="pUp" checked> 大写 A-Z</label>' +
    '<label><input type="checkbox" id="pLo" checked> 小写 a-z</label>' +
    '<label><input type="checkbox" id="pNu" checked> 数字 0-9</label>' +
    '<label><input type="checkbox" id="pSy" checked> 符号 !@#</label></div>' +
    '<div class="row"><button class="btn" id="pGen">重新生成</button>' +
    '<button class="btn dark" id="pCopy">复制</button></div>' +
    '<div class="out" id="pOut" style="font-size:18px;letter-spacing:2px"></div>' +
    '<div class="meter" style="margin-top:10px"><i id="pBar"></i></div>' +
    '<div class="out" id="pInfo" style="margin-top:10px;border-style:solid"></div>';
  function gen() {
    let pool = "";
    if ($("#pUp").checked) pool += "ABCDEFGHJKLMNPQRSTUVWXYZ";
    if ($("#pLo").checked) pool += "abcdefghijkmnpqrstuvwxyz";
    if ($("#pNu").checked) pool += "23456789";
    if ($("#pSy").checked) pool += "!@#$%^&*-_=+?";
    const len = +$("#pLen").value;
    $("#pLenV").textContent = len;
    const out = $("#pOut");
    if (!pool) { out.textContent = "至少勾选一种字符集。"; return; }
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    const pw = Array.from(arr, (x) => pool[x % pool.length]).join("");
    out.textContent = pw;
    const bits = Math.round(len * Math.log2(pool.length));
    const pct = Math.min(100, bits / 1.28);
    const bar = $("#pBar");
    bar.style.width = pct + "%";
    bar.style.background = bits < 50 ? "#d9432f" : bits < 80 ? "#e8a020" : "#3f8f3f";
    $("#pInfo").innerHTML = "字符池 <b>" + pool.length + "</b> 种　熵值 <b>" + bits + " bit</b>　" +
      (bits < 50 ? "弱——几秒可破" : bits < 80 ? "中——离线攻击可挡" : "强——暴力破解需天文数字年") +
      '　<button class="btn ghost" id="pCopy2" style="padding:2px 10px;font-size:12px">复制</button>';
    $("#pCopy2").addEventListener("click", () => copy(pw));
  }
  $("#pLen").addEventListener("input", gen);
  ["#pUp", "#pLo", "#pNu", "#pSy"].forEach((id) => $(id).addEventListener("change", gen));
  $("#pGen").addEventListener("click", gen);
  $("#pCopy").addEventListener("click", () => copy($("#pOut").textContent));
  gen();
});

function copy(text) {
  const ta = document.createElement("textarea");
  ta.value = text; document.body.appendChild(ta); ta.select();
  try { document.execCommand("copy"); } catch {}
  ta.remove();
}

/* ── 05 Base64 ── */
reg("b64", "64", "Base64 编解码", "Unicode 安全", "中英文本皆可，先 encodeURIComponent 再编，不炸生僻字", (el) => {
  el.innerHTML =
    '<div class="row"><span class="lab">原文</span></div>' +
    '<textarea id="bIn" placeholder="输入要编码或解码的文本"></textarea>' +
    '<div class="row" style="margin-top:10px"><button class="btn" id="bEnc">编码 →</button>' +
    '<button class="btn ghost" id="bDec">← 解码</button>' +
    '<button class="btn warn" id="bClr">清空</button></div>' +
    '<div class="out" id="bOut" style="margin-top:10px;min-height:70px"></div>';
  const out = $("#bOut");
  $("#bEnc").addEventListener("click", () => {
    try { out.innerHTML = "Base64：<br><b>" + esc(btoa(encodeURIComponent($("#bIn").value))) + "</b>"; }
    catch { out.textContent = "编码失败。"; }
  });
  $("#bDec").addEventListener("click", () => {
    try { out.innerHTML = "原文：<br><b>" + esc(decodeURIComponent(atob($("#bIn").value.trim()))) + "</b>"; }
    catch { out.textContent = "这不是合法的 Base64 串。"; }
  });
  $("#bClr").addEventListener("click", () => { $("#bIn").value = ""; out.textContent = ""; });
});

/* ── 06 URL 编解码 ── */
reg("url", "%", "URL 编解码", "双模式", "整段编码或组件编码，二选一；中文链接一键还原", (el) => {
  el.innerHTML =
    '<div class="row"><span class="lab">输入</span></div>' +
    '<textarea id="urIn" placeholder="https://example.com/搜索?q=诗词"></textarea>' +
    '<div class="row" style="margin-top:10px">' +
    '<label><input type="radio" name="urMode" value="full" checked> 整段（保留 ://?&=）</label>' +
    '<label><input type="radio" name="urMode" value="comp"> 组件（全部转义）</label></div>' +
    '<div class="row"><button class="btn" id="urEnc">编码 →</button><button class="btn ghost" id="urDec">← 解码</button></div>' +
    '<div class="out" id="urOut" style="margin-top:10px;min-height:70px"></div>';
  const mode = () => document.querySelector('input[name="urMode"]:checked').value;
  $("#urEnc").addEventListener("click", () => {
    const v = $("#urIn").value;
    $("#urOut").innerHTML = "编码：<br><b>" + esc(mode() === "full" ? encodeURI(v) : encodeURIComponent(v)) + "</b>";
  });
  $("#urDec").addEventListener("click", () => {
    try { $("#urOut").innerHTML = "解码：<br><b>" + esc(decodeURI($("#urIn").value)) + "</b>"; }
    catch { $("#urOut").textContent = "解码失败，检查 % 转义是否完整。"; }
  });
});

/* ── 07 JSON 格式化 ── */
reg("json", "{}", "JSON 格式化", "校验行号", "美化 / 压缩 / 错误定位，缩进 2/4/Tab 三档", (el) => {
  el.innerHTML =
    '<div class="row"><span class="lab">JSON</span>' +
    '<select id="jInd"><option value="2">缩进 2</option><option value="4">缩进 4</option><option value="tab">Tab</option></select>' +
    '<button class="btn" id="jFmt">美化</button><button class="btn ghost" id="jMin">压缩</button>' +
    '<button class="btn dark" id="jCopy">复制结果</button></div>' +
    '<textarea id="jIn" style="min-height:150px" placeholder=\'{"toolshed":24,"tools":["单位","颜色"]}\'></textarea>' +
    '<div class="out" id="jOut" style="margin-top:10px;min-height:60px"></div>' +
    '<textarea id="jRes" hidden></textarea>';
  $("#jFmt").addEventListener("click", () => run(true));
  $("#jMin").addEventListener("click", () => run(false));
  $("#jCopy").addEventListener("click", () => copy($("#jRes").value));
  function run(pretty) {
    const raw = $("#jIn").value.trim();
    const out = $("#jOut");
    if (!raw) { out.textContent = "贴一段 JSON 进来。"; return; }
    try {
      const obj = JSON.parse(raw);
      const ind = $("#jInd").value === "tab" ? "\t" : +$("#jInd").value;
      const res = pretty ? JSON.stringify(obj, null, ind) : JSON.stringify(obj);
      $("#jRes").value = res;
      let cnt = "";
      if (Array.isArray(obj)) cnt = "数组 × " + obj.length + " 项";
      else if (typeof obj === "object" && obj) cnt = "对象 × " + Object.keys(obj).length + " 键";
      out.innerHTML = "合法 JSON　" + cnt + "　" + res.length + " 字符（原 " + raw.length + "）";
    } catch (e) {
      const m = /position (\d+)/.exec(e.message);
      let hint = "";
      if (m) {
        const pos = +m[1];
        const line = raw.slice(0, pos).split("\n").length;
        const col = pos - raw.lastIndexOf("\n", pos - 1);
        hint = "——第 <b>" + line + "</b> 行 第 <b>" + col + "</b> 列附近";
        $("#jRes").value = "";
      }
      out.innerHTML = '<span style="color:var(--red)">不合法：' + esc(e.message) + "</span>" + hint;
    }
  }
});

/* ── 08 文本统计 ── */
reg("text", "Ab", "文本统计与变换", "11 项", "字数 / 非空白 / 词数 / 行数等 11 项指标，大小写反转去重一次全做", (el) => {
  el.innerHTML =
    '<textarea id="txIn" placeholder="粘贴一段文本，边打边算"></textarea>' +
    '<div class="out" id="txOut" style="margin-top:10px"></div>' +
    '<div class="row" style="margin-top:10px">' +
    '<button class="btn ghost" data-tx="upper">全大写</button>' +
    '<button class="btn ghost" data-tx="lower">全小写</button>' +
    '<button class="btn ghost" data-tx="title">词首大写</button>' +
    '<button class="btn ghost" data-tx="rev">倒序</button>' +
    '<button class="btn ghost" data-tx="trim">去首尾空白</button>' +
    '<button class="btn ghost" data-tx="dedup">去重复行</button></div>';
  const inp = $("#txIn");
  function stat() {
    const v = inp.value;
    const lines = v ? v.split("\n") : [];
    const words = v.trim() ? v.trim().split(/[\s,，。.!？?；;]+/).filter(Boolean) : [];
    $("#txOut").innerHTML =
      "字符 <b>" + v.length + "</b>　非空白 <b>" + v.replace(/\s/g, "").length + "</b>　" +
      "词 <b>" + words.length + "</b>　行 <b>" + lines.length + "</b>　" +
      "段 <b>" + (v.trim() ? v.trim().split(/\n\s*\n/).length : 0) + "</b>　" +
      "句子 <b>" + (v.match(/[.。!！?？…]+/g) || []).length + "</b><br>" +
      "最长行 <b>" + lines.reduce((m, l) => Math.max(m, l.length), 0) + "</b>　" +
      "英文 <b>" + (v.match(/[a-zA-Z]/g) || []).length + "</b>　" +
      "数字 <b>" + (v.match(/[0-9]/g) || []).length + "</b>　" +
      "中文 <b>" + (v.match(/[\u4e00-\u9fff]/g) || []).length + "</b>　" +
      "标点 <b>" + (v.match(/[，。！？；：、,.!?;:'"“”‘’()（）]/g) || []).length + "</b>";
  }
  inp.addEventListener("input", stat);
  stat();
  el.querySelectorAll("[data-tx]").forEach((b) => b.addEventListener("click", () => {
    const v = inp.value;
    const k = b.dataset.tx;
    if (k === "upper") inp.value = v.toUpperCase();
    else if (k === "lower") inp.value = v.toLowerCase();
    else if (k === "title") inp.value = v.replace(/\b[a-z]/g, (c) => c.toUpperCase());
    else if (k === "rev") inp.value = Array.from(v).reverse().join("");
    else if (k === "trim") inp.value = v.trim().replace(/[ \t]+$/gm, "");
    else if (k === "dedup") {
      const seen = new Set();
      inp.value = lines.filter((l) => (seen.has(l) ? false : (seen.add(l), true))).join("\n");
    }
    stat();
  }));
});

/* ── 09 UUID ── */
reg("uuid", "ID", "UUID 生成", "v4", "crypto 级随机，一次 5 枚，可指定数量批量产", (el) => {
  el.innerHTML =
    '<div class="row"><span class="lab">数量</span><input type="number" id="uiN" min="1" max="20" value="5" style="width:80px">' +
    '<button class="btn" id="uiGen">批量生成</button>' +
    '<button class="btn dark" id="uiCopy">全部复制</button></div>' +
    '<div class="out" id="uiOut"></div>';
  function gen() {
    const n = Math.min(20, Math.max(1, +$("#uiN").value || 5));
    const list = Array.from({ length: n }, () =>
      (crypto.randomUUID ? crypto.randomUUID() :
        "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          return (c === "x" ? r : (r & 3) | 8).toString(16);
        }))
    );
    $("#uiOut").innerHTML = list.map((u) => "<b>" + u + "</b>").join("<br>");
    $("#uiOut").dataset.vals = list.join("\n");
  }
  $("#uiGen").addEventListener("click", gen);
  $("#uiCopy").addEventListener("click", () => copy($("#uiOut").dataset.vals || ""));
  gen();
});

/* ── 10 哈希 ── */
async function sha(algo, text) {
  const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}
reg("hash", "#", "哈希计算", "SHA 家族", "SHA-1 / 256 / 384 / 512 一把梭，本地 WebCrypto 运算", (el) => {
  el.innerHTML =
    '<div class="row"><span class="lab">算法</span><select id="hAlg">' +
    ["SHA-1", "SHA-256", "SHA-384", "SHA-512"].map((a) => "<option" + (a === "SHA-256" ? " selected" : "") + ">" + a + "</option>").join("") +
    '</select><button class="btn" id="hGo">计算</button><button class="btn dark" id="hCopy">复制</button></div>' +
    '<textarea id="hIn" placeholder="输入任意文本，输出十六进制摘要"></textarea>' +
    '<div class="out" id="hOut" style="margin-top:10px"></div>';
  async function run() {
    const v = $("#hIn").value;
    const out = $("#hOut");
    if (!v) { out.textContent = "输入文本后点「计算」。"; return; }
    out.textContent = "计算中…";
    const h = await sha($("#hAlg").value, v);
    out.innerHTML = $("#hAlg").value + "（" + h.length * 4 + " bit）：<br><b>" + h + "</b>";
    out.dataset.v = h;
  }
  $("#hGo").addEventListener("click", run);
  $("#hCopy").addEventListener("click", () => copy($("#hOut").dataset.v || ""));
});

/* ── 11 进制转换 ── */
reg("radix", "01", "进制转换", "2/8/10/16", "输一个数选一个进制，四种进制同时亮出来，支持大整数", (el) => {
  el.innerHTML =
    '<div class="row"><span class="lab">数值</span><input type="text" id="rIn" value="2026" style="width:200px">' +
    '<span class="lab" style="min-width:auto">原进制</span>' +
    '<select id="rFrom"><option>10</option><option>2</option><option>8</option><option>16</option></select></div>' +
    '<div class="out" id="rOut"></div>';
  function run() {
    const raw = $("#rIn").value.trim().replace(/\s/g, "");
    const base = +$("#rFrom").value;
    const out = $("#rOut");
    if (!/^[0-9a-fA-F]+$/.test(raw)) { out.textContent = "只认 0-9 与 a-f 的字符。"; return; }
    const n = parseInt(raw, base);
    if (isNaN(n)) { out.textContent = "解析失败。"; return; }
    out.innerHTML = "二进制 <b>" + n.toString(2) + "</b><br>八进制 <b>" + n.toString(8) +
      "</b><br>十进制 <b>" + n.toString(10) + "</b>（0x" + n.toString(16).toUpperCase() +
      "）<br>十六进制 <b>" + n.toString(16).toUpperCase() + "</b>";
  }
  $("#rIn").addEventListener("input", run);
  $("#rFrom").addEventListener("change", run);
  run();
});

/* ── 12 日期计算 ── */
reg("date", "±", "日期计算", "间隔/加减", "两日期间隔天数，或某日加 N 天 / 减 N 天", (el) => {
  const today = new Date();
  const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  el.innerHTML =
    '<fieldset style="margin-bottom:14px"><legend>间隔</legend>' +
    '<div class="row"><span class="lab">起</span><input type="date" id="dA" value="' + iso(today) + '">' +
    '<span class="lab" style="min-width:auto">止</span><input type="date" id="dB" value="' + iso(new Date(today.getFullYear() + 1, 0, 1)) + '"></div>' +
    '<div class="out" id="dOut1"></div></fieldset>' +
    '<fieldset><legend>加减</legend>' +
    '<div class="row"><span class="lab">基准日</span><input type="date" id="dC" value="' + iso(today) + '">' +
    '<input type="number" id="dN" value="100" style="width:90px"><span>天</span>' +
    '<button class="btn" id="dPlus">＋ 加</button><button class="btn warn" id="dMinus">－ 减</button></div>' +
    '<div class="out" id="dOut2"></div></fieldset>';
  function diff() {
    const a = new Date($("#dA").value + "T00:00:00");
    const b = new Date($("#dB").value + "T00:00:00");
    if (isNaN(a) || isNaN(b)) { $("#dOut1").textContent = "两边都要选日期。"; return; }
    const days = Math.round((b - a) / 864e5);
    const week = ["日", "一", "二", "三", "四", "五", "六"];
    $("#dOut1").innerHTML = "间隔 <b>" + Math.abs(days) + "</b> 天（" + (days >= 0 ? "往后" : "往前") +
      "）　含头尾 <b>" + (Math.abs(days) + 1) + "</b> 天<br>起星期<b>" + week[a.getDay()] +
      "</b>　止星期<b>" + week[b.getDay()] + "</b>";
  }
  function shift(dir) {
    const c = new Date($("#dC").value + "T00:00:00");
    if (isNaN(c)) { $("#dOut2").textContent = "先选基准日。"; return; }
    const n = +$("#dN").value || 0;
    const r = new Date(c.getTime() + dir * n * 864e5);
    const week = "日一二三四五六"[r.getDay()];
    $("#dOut2").innerHTML = "<b>" + fmtDate(r).slice(0, 10) + "</b>　星期" + week +
      "　距今日 <b>" + Math.round((r - new Date().setHours(0, 0, 0, 0)) / 864e5) + "</b> 天";
  }
  ["#dA", "#dB"].forEach((id) => $(id).addEventListener("change", diff));
  $("#dPlus").addEventListener("click", () => shift(1));
  $("#dMinus").addEventListener("click", () => shift(-1));
  diff(); shift(1);
});

/* ═══ 工具墙渲染 ═══ */
const board = $("#pegboard");
TOOLS.forEach((t, i) => {
  const li = document.createElement("li");
  li.className = "tool";
  li.innerHTML =
    '<div class="hook"></div>' +
    '<div class="tool-card" data-id="' + t.id + '">' +
    '<span class="t-tag">' + esc(t.tag) + "</span>" +
    '<span class="t-ico">' + esc(t.ico) + "</span>" +
    "<h3>" + esc(t.name) + "</h3>" +
    "<p>" + esc(t.desc) + "</p>" +
    '<span class="t-num">NO.' + String(i + 1).padStart(2, "0") + "</span>" +
    "</div>";
  li.querySelector(".tool-card").addEventListener("click", () => openBench(t, i));
  board.appendChild(li);
});
$("#toolCount").textContent = TOOLS.length + " 件器械 · 全部本地运算 · 零上传";

/* ═══ 工作台 ═══ */
function openBench(t, i) {
  $("#benchTag").textContent = "NO." + String(i + 1).padStart(2, "0") + " · " + t.tag;
  $("#benchName").textContent = t.name;
  const body = $("#benchBody");
  body.innerHTML = "";
  $("#bench").hidden = false;
  const fs = document.createElement("fieldset");
  const lg = document.createElement("legend");
  lg.textContent = t.name + " · 操作台";
  fs.appendChild(lg);
  t.mount(fs);
  body.appendChild(fs);
  $("#stTool").textContent = "在用：" + t.name;
  $("#bench").scrollIntoView({ behavior: "smooth", block: "nearest" });
}
$("#benchClose").addEventListener("click", () => {
  $("#bench").hidden = true;
  $("#stTool").textContent = "已挂回工具墙";
  window.scrollTo({ top: 0, behavior: "smooth" });
});
