const fallbackData = {
  vozinha: 8900000,
  neymar: 230000000,
  updated_at: null,
  source: "fallback",
  ok: false
};

const copy = {
  pt: {
    badge: "Operação Vozinha Mundial",
    question: "Vozinha já ultrapassou Neymar?",
    loading: "Consultando os oráculos do Instagram...",
    yes: "SIM.",
    no: "NÃO.",
    missingPrefix: "Faltam",
    missingSuffix: "seguidores.",
    surpassedPrefix: "Vozinha passou por",
    surpassedSuffix: "seguidores. O mundo não estava pronto.",
    punchlineNo: "A Espanha também achava que a diferença era grande.",
    punchlineYes: "Aconteceu. Fechem a internet.",
    follow: "Seguir Vozinha",
    share: "Compartilhar",
    statsTitle: "Estatísticas quase ao vivo",
    progress: "Progresso da missão",
    updated: "Última atualização:",
    stale: "Aviso: o Instagram pode bloquear consultas automáticas. Se isso acontecer, o site mantém o último valor salvo.",
    faq1q: "Os números são reais?",
    faq1a: "A intenção é usar os números públicos dos perfis oficiais no Instagram. Se o Instagram bloquear a consulta automática, mostramos o último valor salvo.",
    faq2q: "Vozinha realmente vai ultrapassar Neymar?",
    faq2a: "A matemática é hostil. Mas goleiro bom vive de contrariar probabilidade.",
    faq3q: "Isso é sério?",
    faq3a: "O SIM e o NÃO são sérios. O resto é futebol.",
    footer: "Feito por gente que respeita defesas difíceis.",
    shareTextNo: "Vozinha já ultrapassou Neymar? Ainda não. A Espanha também achava que a diferença era grande.",
    shareTextYes: "Vozinha ultrapassou Neymar. O futebol completou sua missão histórica."
  },
  en: {
    badge: "Operation Global Vozinha",
    question: "Has Vozinha passed Neymar yet?",
    loading: "Consulting the Instagram oracles...",
    yes: "YES.",
    no: "NO.",
    missingPrefix: "Only",
    missingSuffix: "followers to go.",
    surpassedPrefix: "Vozinha is ahead by",
    surpassedSuffix: "followers. The world was not ready.",
    punchlineNo: "Spain also thought the gap was too big.",
    punchlineYes: "It happened. Shut down the internet.",
    follow: "Follow Vozinha",
    share: "Share",
    statsTitle: "Almost live stats",
    progress: "Mission progress",
    updated: "Last update:",
    stale: "Warning: Instagram may block automatic requests. If that happens, the site keeps the last saved value.",
    faq1q: "Are the numbers real?",
    faq1a: "The goal is to use the public follower counts from the official Instagram profiles. If Instagram blocks the automatic check, the site shows the last saved value.",
    faq2q: "Will Vozinha really pass Neymar?",
    faq2a: "The math is hostile. But great goalkeepers live by denying probability.",
    faq3q: "Is this serious?",
    faq3a: "The YES and NO are serious. The rest is football.",
    footer: "Made by people who respect impossible saves.",
    shareTextNo: "Has Vozinha passed Neymar yet? Not yet. Spain also thought the gap was too big.",
    shareTextYes: "Vozinha passed Neymar. Football has completed its historical mission."
  }
};

let lang = "pt";
let currentData = fallbackData;
let hasPassed = false;

function formatNumber(n) {
  return new Intl.NumberFormat(lang === "pt" ? "pt-BR" : "en-US").format(Math.round(n));
}

function formatDate(iso) {
  if (!iso) return lang === "pt" ? "sem atualização automática ainda" : "no automatic update yet";
  return new Intl.DateTimeFormat(lang === "pt" ? "pt-BR" : "en-US", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(iso));
}

async function loadData() {
  try {
    const res = await fetch(`data.json?cache=${Date.now()}`);
    if (!res.ok) throw new Error("data.json not found");
    currentData = await res.json();
  } catch (err) {
    currentData = fallbackData;
  }
  render();
}

function render() {
  const t = copy[lang];
  const vozinha = Number(currentData.vozinha || 0);
  const neymar = Number(currentData.neymar || 0);
  const diff = Math.abs(neymar - vozinha);
  hasPassed = vozinha > neymar;
  const pct = neymar > 0 ? (vozinha / neymar) * 100 : 0;

  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  document.getElementById("langBtn").textContent = lang === "pt" ? "EN" : "PT";

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (t[key]) el.textContent = t[key];
  });

  const answer = document.getElementById("answer");
  answer.textContent = hasPassed ? t.yes : t.no;
  answer.className = `answer ${hasPassed ? "yes" : "no"}`;

  document.getElementById("missingPrefix").textContent = hasPassed ? t.surpassedPrefix : t.missingPrefix;
  document.getElementById("missingCount").textContent = formatNumber(diff);
  document.getElementById("missingSuffix").textContent = hasPassed ? t.surpassedSuffix : t.missingSuffix;

  document.getElementById("punchline").textContent = hasPassed ? t.punchlineYes : t.punchlineNo;
  document.getElementById("vozinhaCount").textContent = formatNumber(vozinha);
  document.getElementById("neymarCount").textContent = formatNumber(neymar);
  document.getElementById("progressPct").textContent = `${pct.toLocaleString(lang === "pt" ? "pt-BR" : "en-US", { maximumFractionDigits: 2 })}%`;
  document.getElementById("progressBar").style.width = `${Math.min(pct, 100)}%`;
  document.getElementById("updatedAt").textContent = formatDate(currentData.updated_at);
  document.getElementById("dataWarning").textContent = currentData.ok ? "" : t.stale;
}

document.getElementById("langBtn").addEventListener("click", () => {
  lang = lang === "pt" ? "en" : "pt";
  render();
});

document.getElementById("shareBtn").addEventListener("click", async () => {
  const t = copy[lang];
  const shareData = {
    title: t.question,
    text: hasPassed ? t.shareTextYes : t.shareTextNo,
    url: window.location.href
  };

  if (navigator.share) {
    await navigator.share(shareData);
    return;
  }

  await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
  alert(lang === "pt" ? "Link copiado!" : "Link copied!");
});

loadData();
