/**
 * PulmoCare - Script Principal
 * Lógica do Jogo, Banco de Casos Clínicos e Avaliação de Condutas de Enfermagem
 * TEMA: EAP, Enfisema, Derrame Pleural, Pneumotórax e Hemotórax.
 */

// Estado da Aplicação
let score = 0;
let streak = 0;
let selectedPatientId = 'p1';
let selectedManchester = null;
let selectedDiagnosis = null;
let currentPatientIndex = 0;
let isTriageConfirmed = false;
let isInterventionsConfirmed = false;

// Registro de pontuação ganha em cada paciente individualmente
let caseScores = { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0 };

function calculateTotalScore() {
    score = Object.values(caseScores).reduce((acc, curr) => acc + curr, 0);
    updateStats();
}

// Banco de Dados de Casos Clínicos
const CLINICAL_CASES = [
    {
        id: 'p1',
        title: 'Caso 1: Sensação de Afogamento',
        name: 'M.L.',
        age: 72,
        gender: 'F',
        avatar: 'ML',
        complaint: '"Sinto que estou me afogando no meu próprio peito! Não consigo ficar deitada de jeito nenhum. Tossindo muito uma espuma rosada."',
        vitals: { hr: 128, bp: '210/120', spo2: 78, rr: 38, temp: '36.4', gly: '160' },
        physicalExam: [
            'Estertores crepitantes bolhosos bilaterais até terço médio/superior dos pulmões.',
            'Expectoração rosada e espumosa característica.',
            'Ortopneia severa e sudorese fria profusa com palidez cutânea.',
            'Turgência jugular patológica e hipertensão severa.'
        ],
        correctManchester: 'red',
        correctDiagnosis: 'edema_agudo',
        diagnosisOptions: [
            { id: 'enfisema', label: 'Exacerbação de Enfisema Pulmonar' },
            { id: 'derrame_pleural', label: 'Derrame Pleural Massivo' },
            { id: 'edema_agudo', label: 'Edema Agudo de Pulmão (EAP Cardiogênico)' },
            { id: 'pneumotorax', label: 'Pneumotórax Espontâneo' }
        ],
        interventions: [
            { id: 'posicao_trendelenburg', label: 'Colocar o paciente na Posição de Trendelenburg (cabeceira baixa).', correct: false, rationale: 'Trendelenburg aumenta o retorno venoso para o coração direito, agravando a congestão pulmonar no EAP.' },
            { id: 'posicao_fowler_pernas', label: 'Posicionar em Fowler 90º com os membros inferiores pendentes ao leito.', correct: true },
            { id: 'vni_cpap', label: 'Instalar Ventilação Não Invasiva (VNI/CPAP) conforme prescrição.', correct: true },
            { id: 'acesso_furosemida', label: 'Administrar diuréticos de alça (Furosemida IV) e vasodilatadores prescritos.', correct: true },
            { id: 'passagem_sve', label: 'Instalar Sondagem Vesical de Demora para controle rigoroso de débito urinário.', correct: true }
        ],
        explanation: 'No Edema Agudo de Pulmão, a congestão força o extravasamento de fluido rosado/espumoso para os alvéolos. A posição sentada com pernas pendentes reduz a pré-carga, enquanto a VNI expulsa o fluido alveolar.'
    },
    {
        id: 'p2',
        title: 'Caso 2: Fumante com Dispneia Progressiva',
        name: 'A.H',
        age: 68,
        gender: 'M',
        avatar: 'SA',
        complaint: '"Sou fumante há 45 anos com enfisema. Há 3 dias aumentou a falta de ar e o catarro. Não consigo dar dez passos sem cansar."',
        vitals: { hr: 108, bp: '150/90', spo2: 84, rr: 28, temp: '37.8', gly: '135' },
        physicalExam: [
            'Tórax em tonel (aumento do diâmetro anteroposterior) e expiração prolongada.',
            'Murmúrio vesicular reduzido globalmente com roncos e estertores esparsos.',
            'Cianose labial e de extremidades.',
            'Sinais de retenção de CO₂ (somnolência leve e asterixe/flapping).'
        ],
        correctManchester: 'orange',
        correctDiagnosis: 'enfisema',
        diagnosisOptions: [
            { id: 'edema_agudo', label: 'Edema Agudo de Pulmão' },
            { id: 'enfisema', label: 'Enfisema Pulmonar Exacerbado (Retentor de CO₂)' },
            { id: 'hemotorax', label: 'Hemotórax Agudo' },
            { id: 'pneumotorax', label: 'Pneumotórax Hipertensivo' }
        ],
        interventions: [
            { id: 'o2_venturi', label: 'Oferecer O₂ via Máscara de Venturi a 24%-28% mantendo alvo de SpO₂ entre 88% e 92%.', correct: true },
            { id: 'pos_fowler', label: 'Manter paciente em Posição de Fowler (sentado).', correct: true },
            { id: 'gasometria', label: 'Auxiliar na coleta urgente de Gasometria Arterial.', correct: true },
            { id: 'o2_alto_fluxo', label: 'Ofertar O₂ a 15 L/min em máscara não reinalante sem controle de FiO₂.', correct: false, rationale: 'No enfisema com retenção de CO₂, oxigênio descontrolado inibe o drive respiratório hipóxico, gerando parada respiratória.' },
            { id: 'monitorar_narcose', label: 'Monitorar padrão respiratório e sinais de narcose por CO₂.', correct: true }
        ],
        explanation: 'No Enfisema Pulmonar com retenção de CO₂, o estímulo respiratório depende da hipoxemia. Oxigenoterapia em alto fluxo descontrolada inibe o centro respiratório. Use Máscara de Venturi (alvo de SpO₂ 88-92%).'
    },
    {
        id: 'p3',
        title: 'Caso 3: Peso na Base do Tórax',
        name: 'D.H.',
        age: 61,
        gender: 'F',
        avatar: 'DH',
        complaint: '"Sinto um peso enorme do lado esquerdo do peito que piora ao respirar fundo há uma semana. O ar parece não entrar no peito."',
        vitals: { hr: 98, bp: '130/80', spo2: 91, rr: 26, temp: '37.2', gly: '115' },
        physicalExam: [
            'Abolição completa do murmúrio vesicular na base do hemitórax esquerdo.',
            'Macicez firme à percussão na base esquerda (sinal de acúmulo de líquido na pleura).',
            'Frêmito tátil-vocal abolido na região afetada.',
            'Expansibilidade torácica diminuída à esquerda.'
        ],
        correctManchester: 'yellow',
        correctDiagnosis: 'derrame_pleural',
        diagnosisOptions: [
            { id: 'pneumotorax', label: 'Pneumotórax Hipertensivo' },
            { id: 'enfisema', label: 'Enfisema Pulmonar' },
            { id: 'edema_agudo', label: 'Edema Agudo de Pulmão' },
            { id: 'derrame_pleural', label: 'Derrame Pleural Massivo à Esquerda' }
        ],
        interventions: [
            { id: 'posicao_conforto', label: 'Posicionar com cabeceira elevada (Fowler) para favorecer a ventilação.', correct: true },
            { id: 'preparo_toracocentese', label: 'Preparar material para Toracocentese Diagnóstica/Esvaziadora.', correct: true },
            { id: 'o2_canula', label: 'Instalar cânula nasal de O₂ (1-3 L/min) conforme prescrição.', correct: true },
            { id: 'ausculta_rigorosa', label: 'Realizar ausculta pulmonar antes e após o procedimento de drenagem/punção.', correct: true },
            { id: 'nebulizacao_resgate', label: 'Administrar broncodilatador contínuo para expandir a pleura.', correct: false, rationale: 'Broncodilatadores atuam no músculo liso bronquial, não tendo efeito sobre o acúmulo de líquido no espaço pleural.' }
        ],
        explanation: 'O Derrame Pleural é o acúmulo anômalo de líquido no espaço pleural, gerando macicez à percussão e murmúrio abolido. O tratamento imediato envolve toracocentese aliviadora ou drenagem torácica.'
    },
    {
        id: 'p4',
        title: 'Caso 4: Dor Súbita no Tórax',
        name: 'L.M',
        age: 22,
        gender: 'M',
        avatar: 'LM',
        complaint: '"Estava jogando basquete quando senti uma dor em pontada súbita no tórax direito. Agora o ar não entra mais e estou ficando tonto."',
        vitals: { hr: 142, bp: '80/45', spo2: 81, rr: 40, temp: '36.6', gly: '98' },
        physicalExam: [
            'Ausência total de murmúrio vesicular no hemitórax direito com hipertimpanismo à percussão.',
            'Desvio visível da traqueia para o lado esquerdo (contralateral).',
            'Turgência jugular bilateral grave e hipotensão severa (choque obstrutivo).',
            'Enfisema subcutâneo palpável na região clavicular direita.'
        ],
        correctManchester: 'red',
        correctDiagnosis: 'pneumotorax',
        diagnosisOptions: [
            { id: 'pneumotorax', label: 'Pneumotórax Hipertensivo à Direita' },
            { id: 'derrame_pleural', label: 'Derrame Pleural' },
            { id: 'edema_agudo', label: 'Edema Agudo de Pulmão' },
            { id: 'enfisema', label: 'Enfisema Pulmonar' }
        ],
        interventions: [
            { id: 'puncao_descompressiva', label: 'Auxiliar na Punção Aliviadora de Urgência (Toracocentese no 2º EIC na linha hemiclavicular).', correct: true },
            { id: 'o2_alto_fluxo', label: 'Ofertar O₂ a 100% em máscara não reinalante.', correct: true },
            { id: 'preparo_drenagem', label: 'Montar e testar o sistema de Drenagem Torácica em Selo d\'Água.', correct: true },
            { id: 'monitorar_choque', label: 'Monitorar sinais de choque obstrutivo e turgência jugular.', correct: true },
            { id: 'curativo_compressivo_total', label: 'Ocluir completamente as vias aéreas do paciente antes da punção.', correct: false, rationale: 'O pneumotórax hipertensivo necessita da saída imediata do ar preso no espaço pleural via punção/drenagem.' }
        ],
        explanation: 'O Pneumotórax Hipertensivo ocorre quando o ar entra na cavidade pleural e não sai, colabando o pulmão e gerando hipertimpanismo e desvio de traqueia. Exige punção descompressiva imediata.'
    },
    {
        id: 'p5',
        title: 'Caso 5: Acompanhamento de Derrame Pleural',
        name: 'R.C.',
        age: 52,
        gender: 'M',
        avatar: 'RC',
        complaint: '"Vim trazer o raio-X de controle. Tive uma pneumonia há 3 semanas e o médico pediu para reavaliar a sobra de líquido. Não sinto falta de ar nem dor agora."',
        vitals: { hr: 76, bp: '120/80', spo2: 98, rr: 16, temp: '36.5', gly: '92' },
        physicalExam: [
            'Paciente corado, eupneico em ar ambiente, acianótico e hemodinamicamente estável.',
            'Discreta submacicez em extrema base pulmonar esquerda à percussão.',
            'Murmúrio vesicular presente bilateralmente, apenas levemente reduzido em base esquerda.',
            'Sem uso de musculatura acessória ou sinais de desconforto respiratório.'
        ],
        correctManchester: 'blue',
        correctDiagnosis: 'derrame_pleural',
        diagnosisOptions: [
            { id: 'pneumotorax', label: 'Pneumotórax Hipertensivo' },
            { id: 'edema_agudo', label: 'Edema Agudo de Pulmão' },
            { id: 'hemotorax', label: 'Hemotórax Traumático Agudo' },
            { id: 'derrame_pleural', label: 'Pequeno Derrame Pleural residual (Laminar)' }
        ],
        interventions: [
            { id: 'orientar_ambulatorio', label: 'Orientar o paciente a aguardar atendimento médico ambulatorial com calma, pois os sinais vitais estão estáveis.', correct: true },
            { id: 'verificar_sinais_estaveis', label: 'Aferir e registrar os sinais vitais completos e confirmar ausência de desconforto respiratório.', correct: true },
            { id: 'orientar_sinais_alerta', label: 'Orientar o paciente sobre sinais de alarme (febre, dor súbita ou falta de ar) para reclassificação imediata se houver piora.', correct: true },
            { id: 'o2_alto_fluxo_urgente', label: 'Instalar imediatamente Máscara de Oxigênio em Alto Fluxo (15 L/min).', correct: false, rationale: 'Paciente está eupneico, com SpO₂ de 98% em ar ambiente. Oxigenoterapia em alto fluxo é totalmente desnecessária e inadequada.' },
            { id: 'preparar_drenagem_emergencia', label: 'Preparar material para drenagem torácica de emergência imediata.', correct: false, rationale: 'Não há indicação de procedimento invasivo de emergência em pequeno derrame assintomático e estável.' }
        ],
        explanation: 'Pacientes com pequeno derrame pleural residual estável e sem desconforto respiratório (SpO₂ 98%, FR 16) são classificados como VERDE (Pouco Urgente). A conduta de enfermagem é acolher, monitorar e orientar enquanto aguarda a avaliação médica sem necessidade de intervenções invasivas.'
    }
];

// Banco de Questões do Desafio de Plantão
const QUIZ_QUESTIONS = [
    {
        question: 'Durante a ausculta e percussão de um paciente com queixa de dor torácica e dispneia, o enfermeiro nota macicez à percussão e murmúrio vesicular abolido na base direita. Qual condição é compatível?',
        options: [
            'Pneumotórax Hipertensivo',
            'Crise de Enfisema Pulmonar',
            'Derrame Pleural ou Hemotórax',
            'Crise Asmática Leve'
        ],
        correct: 2,
        explanation: 'Presença de líquido (seja transudato/exsudato no Derrame Pleural ou sangue no Hemotórax) gera MACICEZ à percussão e abolição dos sons respiratórios.'
    },
    {
        question: 'No manejo do paciente com Enfisema Pulmonar exacerbado e histórico de retenção crônica de CO₂, qual o cuidado essencial na oxigenoterapia?',
        options: [
            'Instalar máscara não reinalante a 15 L/min para manter SpO₂ em 100%',
            'Manter o paciente em Posição de Trendelenburg com O₂ a 10 L/min',
            'Restringir totalmente o oxigênio mesmo com SpO₂ abaixo de 70%',
            'Oferecer O₂ via Máscara de Venturi controlada (alvo SpO₂ 88-92%) para não inibir o drive respiratório'
        ],
        correct: 3,
        explanation: 'Em enfisematosos retentores crônicos, a hiperóxia descontrolada remove o estímulo hipóxico da respiração, podendo levar a narcose por CO₂ e parada respiratória.'
    },
    {
        question: 'Qual o achado clínico e a característica da secreção típicos do Edema Agudo de Pulmão (EAP) Cardiogênico?',
        options: [
            'Ortopneia, estertores crepitantes bilaterais e expectoração espumosa e rosada',
            'Tosse seca com estridor laríngeo e macicez localizada',
            'Secreção purulenta esverdeada com hipertimpanismo torácico',
            'Dor em pontada com expectoração amarelada e murmúrio normal'
        ],
        correct: 0,
        explanation: 'A hipertensão capilar pulmonar no EAP força o extravasamento de plasma e hemácias para os alvéolos, gerando crepitações e secreção rosada/espumosa.'
    },
    {
        question: 'Ao assistir um paciente em pós-operatório imediato de Drenagem Torácica por Hemotórax, qual sinal no frasco de drenagem exige notificação imediata à equipe médica?',
        options: [   
            'Oscilação da coluna de água do selo d\'água durante as incursões respiratórias',
            'Frasco mantido abaixo do nível do tórax do paciente',
            'Presença de 2 cm de solução fisiológica estéril formando o selo d\'água',
            'Drenagem de conteúdo sanguinolento superior a 200 ml/hora nas primeiras horas'
        ],
        correct: 3,
        explanation: 'Débito sanguinolento acumulado superior a 200 ml/h indica sangramento arterial ativo no tórax (hemotórax maciço), com indicação de toracotomia de urgência.'
    },
    {
        question: 'Um paciente vítima de trauma apresenta turgência jugular, hipotensão (choque obstrutivo), hipertimpanismo à percussão à direita e desvio da traqueia para a esquerda. Qual a conduta imediata?',
        options: [
            'Realizar massagem cardíaca externa e nebulização com resgate',
            'Auxiliar na Punção Descompressiva de Urgência no 2º espaço intercostal (Pneumotórax Hipertensivo)',
            'Instalar drenagem pleural com sucção negativa sem descompressão',
            'Administrar diurético de alça endovenoso para aliviar a traqueia'
        ],
        correct: 1,
        explanation: 'A hipertensão pleural no pneumotórax hipertensivo comprime o mediastino. A descompressão com agulha no 2º EIC salva a vida do paciente antes do dreno definitivo.'
    }
];

let currentQuizIdx = 0;
let quizTimer = null;
let quizTimeLeft = 90;

// Inicialização da Página
document.addEventListener('DOMContentLoaded', () => {
    renderPatientTabs();
    loadPatientCase('p1');
    initQuiz();
});

const MANCHESTER_NAMES = {
    red: 'Vermelho',
    orange: 'Laranja',
    yellow: 'Amarelo',
    green: 'Verde',
    blue: 'Azul'
};

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(el => {
        el.classList.remove('active', 'text-cyan-400', 'bg-cyan-950/60', 'border', 'border-cyan-500/30');
        el.classList.add('text-slate-400');
    });

    document.getElementById(`tab-${tabId}`).classList.remove('hidden');
    const activeBtn = document.getElementById(`tab-btn-${tabId}`);
    if (activeBtn) {
        activeBtn.classList.add('active', 'text-cyan-400', 'bg-cyan-950/60', 'border', 'border-cyan-500/30');
        activeBtn.classList.remove('text-slate-400');
    }

    if (tabId === 'quiz') {
        resetQuizState();
    }
}

let unlockedPatients = ['p1'];
let completedPatients = [];

function renderPatientTabs() {
    const container = document.getElementById('patient-selector');
    if (!container) return;
    container.innerHTML = '';

    CLINICAL_CASES.forEach((c) => {
        const isCurrent = (c.id === selectedPatientId);
        const isCompleted = completedPatients.includes(c.id);
        const isUnlocked = unlockedPatients.includes(c.id);

        const btn = document.createElement('button');
        
        if (isUnlocked) {
            btn.onclick = () => loadPatientCase(c.id);
        } else {
            btn.disabled = true;
        }

        btn.id = `btn-patient-${c.id}`;

        let styleClasses = 'p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-20 ';
        let statusIconHTML = '';

        if (isCurrent) {
            styleClasses += 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10 cursor-pointer';
            statusIconHTML = `<span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>`;
        } else if (isCompleted) {
            styleClasses += 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/40 cursor-pointer';
            statusIconHTML = `<i class="fa-solid fa-circle-check text-emerald-400 text-xs"></i>`;
        } else {
            styleClasses += 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-50 cursor-not-allowed';
            statusIconHTML = `<i class="fa-solid fa-lock text-slate-600 text-xs"></i>`;
        }

        btn.className = styleClasses;
        
        btn.innerHTML = `
            <div class="flex items-center justify-between w-full">
                <span class="text-[10px] font-bold uppercase tracking-wider ${isCurrent ? 'text-cyan-400' : isCompleted ? 'text-emerald-400' : 'text-slate-600'}">${c.id.toUpperCase()}</span>
                ${statusIconHTML}
            </div>
            <div class="font-bold text-xs truncate ${isUnlocked ? 'text-slate-200' : 'text-slate-500'}">${c.title.split(':')[1] || c.title}</div>
            <div class="text-[10px] ${isUnlocked ? 'text-slate-400' : 'text-slate-600'} truncate">${c.name} (${c.age}a)</div>
        `;
        container.appendChild(btn);
    });
}

function loadPatientCase(patientId) {
    selectedPatientId = patientId;
    selectedManchester = null;
    selectedDiagnosis = null;
    isTriageConfirmed = false;
    isInterventionsConfirmed = false;
    currentPatientIndex = CLINICAL_CASES.findIndex(p => p.id === patientId);

    const triageFb = document.getElementById('triage-feedback');
    if (triageFb) triageFb.classList.add('hidden');
    
    const stepInterv = document.getElementById('step-interventions');
    if (stepInterv) {
        stepInterv.classList.add('hidden');
        stepInterv.classList.remove('block');
    }

    renderPatientTabs();

    const patient = CLINICAL_CASES.find(p => p.id === patientId);
    if (!patient) return;

    document.getElementById('patient-avatar').innerText = patient.avatar;
    document.getElementById('patient-name').innerText = patient.name;
    document.getElementById('patient-demographics').innerText = `${patient.age} anos • ${patient.gender}`;
    document.getElementById('patient-complaint').innerText = patient.complaint;

    const statusBadge = document.getElementById('patient-badge-status');
    if (statusBadge) {
        if (completedPatients.includes(patientId)) {
            statusBadge.innerText = 'Liberado';
            statusBadge.className = 'px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-600/50';
        } else {
            statusBadge.innerText = 'Em triagem';
            statusBadge.className = 'px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700 text-slate-300';
        }
    }

    document.getElementById('vitals-hr').innerText = patient.vitals.hr;
    document.getElementById('vitals-bp').innerText = patient.vitals.bp;
    document.getElementById('vitals-spo2').innerText = `${patient.vitals.spo2}%`;
    document.getElementById('vitals-rr').innerText = patient.vitals.rr;
    document.getElementById('vitals-temp').innerText = `${patient.vitals.temp} °C`;
    document.getElementById('vitals-gly').innerText = `${patient.vitals.gly} mg/dL`;

    const examContainer = document.getElementById('physical-exam-findings');
    examContainer.innerHTML = patient.physicalExam.map(item => `
        <div class="flex items-start gap-2">
            <i class="fa-solid fa-angle-right text-cyan-400 text-xs mt-0.5"></i>
            <span>${item}</span>
        </div>
    `).join('');

    document.querySelectorAll('.manchester-btn').forEach(btn => {
        btn.classList.remove('ring-2', 'ring-cyan-400', 'scale-[1.02]', 'opacity-60', 'cursor-not-allowed');
        btn.disabled = false;
    });

    const diagContainer = document.getElementById('diagnosis-options');
    diagContainer.innerHTML = '';
    patient.diagnosisOptions.forEach(opt => {
        const dBtn = document.createElement('button');
        dBtn.onclick = () => selectDiagnosis(opt.id);
        dBtn.id = `diag-opt-${opt.id}`;
        dBtn.className = `p-3 rounded-xl border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800/80 text-left text-xs text-slate-300 font-medium transition-all flex items-center justify-between`;
        dBtn.innerHTML = `
            <span>${opt.label}</span>
            <i class="fa-regular fa-circle text-slate-500 text-sm check-icon"></i>
        `;
        diagContainer.appendChild(dBtn);
    });
    
    const confirmBtn = document.getElementById('confirm-triage-btn');
    if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    const interContainer = document.getElementById('interventions-checklist');
    interContainer.innerHTML = '';
    patient.interventions.forEach((item, index) => {
        const label = document.createElement('label');
        label.className = `flex items-start gap-3 p-3 rounded-xl border border-slate-700/60 bg-slate-900/50 hover:bg-slate-800/60 cursor-pointer transition-all text-xs text-slate-200`;
        label.innerHTML = `
            <input type="checkbox" id="chk-inter-${index}" value="${item.id}" class="mt-0.5 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500/20 bg-slate-800 w-4 h-4">
            <span class="flex-1">${item.label}</span>
        `;
        interContainer.appendChild(label);
    });

    const evalBtn = document.getElementById('evaluate-interventions-btn');
    if (evalBtn) {
        evalBtn.disabled = false;
        evalBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
    const feedbackBox = document.getElementById('case-feedback');
    if (feedbackBox) feedbackBox.classList.add('hidden');
}

function selectManchester(color) {
    if (isTriageConfirmed) return;
    selectedManchester = color;
    document.querySelectorAll('.manchester-btn').forEach(btn => {
        btn.classList.remove('ring-2', 'ring-cyan-400', 'scale-[1.02]');
    });
    const selectedBtn = document.getElementById(`manchester-${color}`);
    if (selectedBtn) {
        selectedBtn.classList.add('ring-2', 'ring-cyan-400', 'scale-[1.02]');
    }
}

function selectDiagnosis(diagId) {
    if (isTriageConfirmed) return;
    selectedDiagnosis = diagId;
    const patient = CLINICAL_CASES.find(p => p.id === selectedPatientId);
    if (!patient) return;

    patient.diagnosisOptions.forEach(opt => {
        const btn = document.getElementById(`diag-opt-${opt.id}`);
        if (!btn) return;
        const icon = btn.querySelector('.check-icon');
        if (opt.id === diagId) {
            btn.className = `p-3 rounded-xl border border-cyan-500/80 bg-cyan-950/40 text-left text-xs text-cyan-200 font-semibold transition-all flex items-center justify-between ring-1 ring-cyan-500/50`;
            if (icon) icon.className = `fa-solid fa-circle-check text-cyan-400 text-sm check-icon`;
        } else {
            btn.className = `p-3 rounded-xl border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800/80 text-left text-xs text-slate-300 font-medium transition-all flex items-center justify-between`;
            if (icon) icon.className = `fa-regular fa-circle text-slate-500 text-sm check-icon`;
        }
    });
}

function confirmTriageStep() {
    if (isTriageConfirmed) return;
    if (!selectedManchester || !selectedDiagnosis) {
        alert('Por favor, selecione a Classificação de Manchester E a Hipótese Diagnóstica antes de prosseguir.');
        return;
    }

    const patient = CLINICAL_CASES.find(p => p.id === selectedPatientId);
    if (!patient) return;

    const selectedManchesterPT = MANCHESTER_NAMES[selectedManchester] || selectedManchester;
    const correctManchesterPT = MANCHESTER_NAMES[patient.correctManchester] || patient.correctManchester;
    
    isTriageConfirmed = true;

    document.querySelectorAll('.manchester-btn').forEach(btn => {
        btn.disabled = true;
        btn.classList.add('opacity-60', 'cursor-not-allowed');
    });

    patient.diagnosisOptions.forEach(opt => {
        const btn = document.getElementById(`diag-opt-${opt.id}`);
        if (btn) {
            btn.disabled = true;
            btn.classList.add('opacity-60', 'cursor-not-allowed');
        }
    });

    const confirmBtn = document.getElementById('confirm-triage-btn');
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }

    const isTriageCorrect = (selectedManchester === patient.correctManchester);
    const isDiagnosisCorrect = (selectedDiagnosis === patient.correctDiagnosis);

    let triagePointsEarned = 0;
    if (isTriageCorrect) triagePointsEarned += 75;
    if (isDiagnosisCorrect) triagePointsEarned += 75;

    caseScores[selectedPatientId] = triagePointsEarned;
    calculateTotalScore();

    const feedbackBox = document.getElementById('triage-feedback');
    feedbackBox.classList.remove('hidden');

    const selectedDiagLabel = patient.diagnosisOptions.find(d => d.id === selectedDiagnosis)?.label;
    const correctDiagLabel = patient.diagnosisOptions.find(d => d.id === patient.correctDiagnosis)?.label;

    if (isTriageCorrect && isDiagnosisCorrect) {
        feedbackBox.className = "p-4 rounded-xl border border-emerald-500/60 bg-emerald-950/30 text-emerald-200 space-y-3";
        feedbackBox.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
                    <i class="fa-solid fa-circle-check text-lg"></i> Triagem e Diagnóstico Perfeitos!
                </div>
                <span class="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/40">
                    +150 pts
                </span>
            </div>
            <p class="text-xs text-slate-200 leading-relaxed">
                Você classificou corretamente como <strong class="text-emerald-300 uppercase">${correctManchesterPT}</strong> (+75 pts) e identificou a síndrome <strong class="text-emerald-300">${correctDiagLabel}</strong> (+75 pts).
            </p>
            <div>
                <button onclick="showInterventionsStep()" class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md w-full sm:w-auto">
                    Ir para Condutas de Enfermagem <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        `;
    } else if (isTriageCorrect || isDiagnosisCorrect) {
        feedbackBox.className = "p-4 rounded-xl border border-amber-500/60 bg-amber-950/30 text-amber-200 space-y-3";
        feedbackBox.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
                    <i class="fa-solid fa-triangle-exclamation text-lg"></i> Avaliação Parcial da Triagem
                </div>
                <span class="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/40">
                    +${triagePointsEarned} pts
                </span>
            </div>
            <ul class="text-xs text-slate-200 space-y-1.5 list-disc list-inside">
                ${isTriageCorrect 
                    ? `<li class="text-emerald-300">Classificação de Manchester correta! (${correctManchesterPT}) (+75 pts)</li>` 
                    : `<li>Classificação informada: <strong>${selectedManchesterPT.toUpperCase()}</strong> (0 pts). O correto seria <strong class="text-amber-300">${correctManchesterPT.toUpperCase()}</strong>.</li>`}
                ${isDiagnosisCorrect 
                    ? '<li class="text-emerald-300">Hipótese Diagnóstica correta! (+75 pts)</li>' 
                    : `<li>Diagnóstico informado: <strong>${selectedDiagLabel}</strong> (0 pts). A hipótese prioritária é <strong class="text-amber-300">${correctDiagLabel}</strong>.</li>`}
            </ul>
            <div>
                <button onclick="showInterventionsStep()" class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md w-full sm:w-auto">
                    Avançar para Condutas de Enfermagem <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        `;
    } else {
        feedbackBox.className = "p-4 rounded-xl border border-rose-500/60 bg-rose-950/30 text-rose-200 space-y-3";
        feedbackBox.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5 text-rose-400 font-bold text-sm">
                    <i class="fa-solid fa-circle-xmark text-lg"></i> Triagem e Diagnóstico Incorretos
                </div>
                <span class="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-mono text-xs font-bold border border-rose-500/40">
                    +0 pts
                </span>
            </div>
            <ul class="text-xs text-slate-200 space-y-1.5 list-disc list-inside">
                <li>Classificação informada: <strong>${selectedManchesterPT.toUpperCase()}</strong> (0 pts). O correto pelo protocolo seria <strong class="text-rose-300">${correctManchesterPT.toUpperCase()}</strong>.</li>
                <li>Diagnóstico informado: <strong>${selectedDiagLabel}</strong> (0 pts). A hipótese prioritária é <strong class="text-rose-300">${correctDiagLabel}</strong>.</li>
            </ul>
            <div>
                <button onclick="showInterventionsStep()" class="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md w-full sm:w-auto">
                    Avançar para Condutas de Enfermagem <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        `;
    }

    feedbackBox.scrollIntoView({ behavior: 'smooth' });
}

function showInterventionsStep() {
    const stepInterventions = document.getElementById('step-interventions');
    if (stepInterventions) {
        stepInterventions.classList.remove('hidden');
        stepInterventions.classList.add('block');
        stepInterventions.scrollIntoView({ behavior: 'smooth' });
    }
}

function evaluateInterventions() {
    if (!completedPatients.includes(selectedPatientId)) {
        completedPatients.push(selectedPatientId);
    }

    const statusBadge = document.getElementById('patient-badge-status');
    if (statusBadge) {
        statusBadge.innerText = 'Liberado';
        statusBadge.className = 'px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-600/50';
    }

    if (currentPatientIndex < CLINICAL_CASES.length - 1) {
        const nextPatientId = CLINICAL_CASES[currentPatientIndex + 1].id;
        if (!unlockedPatients.includes(nextPatientId)) {
            unlockedPatients.push(nextPatientId);
        }
    }

    renderPatientTabs();
    if (isInterventionsConfirmed) return;

    const patient = CLINICAL_CASES[currentPatientIndex];
    if (!patient) return;

    isInterventionsConfirmed = true;

    patient.interventions.forEach((item, index) => {
        const chk = document.getElementById(`chk-inter-${index}`);
        if (chk) {
            chk.disabled = true;
            chk.parentElement.classList.add('opacity-60', 'cursor-not-allowed');
        }
    });

    const evalBtn = document.getElementById('evaluate-interventions-btn');
    if (evalBtn) {
        evalBtn.disabled = true;
        evalBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }

    let checkedInterventions = [];
    patient.interventions.forEach((item, index) => {
        const chk = document.getElementById(`chk-inter-${index}`);
        if (chk && chk.checked) {
            checkedInterventions.push(item.id);
        }
    });

    let correctGainedPoints = 0;
    let penaltyPoints = 0;
    let interventionErrors = [];
    let correctCount = 0;
    let wrongCount = 0;

    patient.interventions.forEach((item) => {
        const wasChecked = checkedInterventions.includes(item.id);
        if (item.correct && wasChecked) {
            correctCount++;
            correctGainedPoints += 30;
        } else if (!item.correct && wasChecked) {
            wrongCount++;
            penaltyPoints += 15;
            interventionErrors.push(`Conduta Indevida: "${item.label}" - ${item.rationale}`);
        } else if (item.correct && !wasChecked) {
            interventionErrors.push(`Conduta Esquecida: "${item.label}" era necessária.`);
        }
    });

    const netInterventionPoints = Math.max(0, correctGainedPoints - penaltyPoints);

    if (correctCount > 0) {
        caseScores[selectedPatientId] = (caseScores[selectedPatientId] || 0) + netInterventionPoints;
    } else {
        caseScores[selectedPatientId] = Math.max(0, (caseScores[selectedPatientId] || 0) - 15);
    }
    calculateTotalScore();

    const feedbackBox = document.getElementById('case-feedback');
    feedbackBox.classList.remove('hidden');

    const isLastPatient = (currentPatientIndex === CLINICAL_CASES.length - 1);
    const nextButtonHTML = isLastPatient
        ? `<button onclick="openCasesCompletionModal()" class="mt-4 w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all">
                <i class="fa-solid fa-flag-checkered text-sm"></i> Finalizar Simulação & Ver Resultado <i class="fa-solid fa-arrow-right"></i>
        </button>`
        : `<button onclick="nextPatientCase()" class="mt-4 w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all">
                Próximo Paciente (${currentPatientIndex + 2}/5) <i class="fa-solid fa-arrow-right"></i>
        </button>`;

    let scoreBreakdownText = `Você acertou ${correctCount} conduta(s) (+${correctGainedPoints} pts)`;
    if (wrongCount > 0) {
        scoreBreakdownText += ` e selecionou ${wrongCount} indevida(s) (-${penaltyPoints} pts).`;
    } else {
        scoreBreakdownText += `.`;
    }

    if (correctCount > 0 && interventionErrors.length === 0) {
        feedbackBox.className = "glass-panel p-6 rounded-2xl space-y-4 border-2 border-emerald-500/60 bg-emerald-950/20";
        feedbackBox.innerHTML = `
            <div class="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <div class="flex items-center gap-3 text-emerald-400">
                    <i class="fa-solid fa-circle-check text-2xl"></i>
                    <div>
                        <h4 class="font-bold text-base">Excelente Assistência de Enfermagem!</h4>
                        <p class="text-xs text-slate-300">Todas as condutas indicadas foram executadas com perfeição.</p>
                    </div>
                </div>
                <span class="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-sm font-bold border border-emerald-500/40">
                    +${netInterventionPoints} pts
                </span>
            </div>
            <p class="text-xs text-slate-300 pt-1">${patient.explanation}</p>
            ${nextButtonHTML}
        `;
        streak++;
        if (typeof confetti === 'function') confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });

    } else if (correctCount > 0) {
        feedbackBox.className = "glass-panel p-6 rounded-2xl space-y-4 border-2 border-amber-500/60 bg-amber-950/20";
        feedbackBox.innerHTML = `
            <div class="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <div class="flex items-center gap-3 text-amber-400">
                    <i class="fa-solid fa-triangle-exclamation text-2xl"></i>
                    <div>
                        <h4 class="font-bold text-base">Plano de Assistência Parcial</h4>
                        <p class="text-xs text-slate-300">${scoreBreakdownText}</p>
                    </div>
                </div>
                <span class="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-sm font-bold border border-amber-500/40">
                    +${netInterventionPoints} pts
                </span>
            </div>
            <ul class="text-xs text-slate-300 space-y-1.5 list-disc list-inside pt-1">
                ${interventionErrors.map(err => `<li class="text-amber-200">${err}</li>`).join('')}
            </ul>
            <p class="text-xs text-slate-400 italic pt-2">${patient.explanation}</p>
            ${nextButtonHTML}
        `;
        streak = 0;

    } else {
        feedbackBox.className = "glass-panel p-6 rounded-2xl space-y-4 border-2 border-rose-500/60 bg-rose-950/20";
        feedbackBox.innerHTML = `
            <div class="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <div class="flex items-center gap-3 text-rose-400">
                    <i class="fa-solid fa-circle-xmark text-2xl"></i>
                    <div>
                        <h4 class="font-bold text-base">Plano de Assistência Inadequado</h4>
                        <p class="text-xs text-slate-300">Nenhuma conduta indicada foi executada corretamente.</p>
                    </div>
                </div>
                <span class="px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-xs font-bold border border-rose-500/40">
                    -15 pts
                </span>
            </div>
            <ul class="text-xs text-slate-300 space-y-1.5 list-disc list-inside pt-1">
                ${interventionErrors.length > 0 
                    ? interventionErrors.map(err => `<li class="text-rose-200">${err}</li>`).join('')
                    : '<li class="text-rose-200">Nenhuma intervenção necessária foi selecionada para o atendimento inicial.</li>'
                }
            </ul>
            <p class="text-xs text-slate-400 italic pt-2">${patient.explanation}</p>
            ${nextButtonHTML}
        `;
        streak = 0;
    }

    updateStats();
    feedbackBox.scrollIntoView({ behavior: 'smooth' });
}

function nextPatientCase() {
    if (currentPatientIndex < CLINICAL_CASES.length - 1) {
        currentPatientIndex++;
        const nextPatient = CLINICAL_CASES[currentPatientIndex];
        loadPatientCase(nextPatient.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function resetCurrentCase() {
    caseScores[selectedPatientId] = 0;
    calculateTotalScore();
    loadPatientCase(selectedPatientId);
}

function updateStats() {
    const statScore = document.getElementById('stat-score');
    const statStreak = document.getElementById('stat-streak');
    const statBadge = document.getElementById('stat-badge');

    if (statScore) statScore.innerText = score;
    if (statStreak) statStreak.innerText = streak;

    let badge = 'Estudante';
    if (score >= 500) badge = 'Enfermeiro Pleno';
    if (score >= 1000) badge = 'Especialista em Emergência';
    if (statBadge) statBadge.innerText = badge;
}

// LÓGICA DO QUIZ (TAB 2)
function initQuiz() {
    currentQuizIdx = 0;
}

function resetQuizState() {
    currentQuizIdx = 0;
    showQuizQuestion(currentQuizIdx);
}

function showQuizQuestion(idx) {
    clearInterval(quizTimer);
    quizTimeLeft = 90;
    
    const q = QUIZ_QUESTIONS[idx];
    document.getElementById('quiz-current-idx').innerText = idx + 1;
    document.getElementById('quiz-total-idx').innerText = QUIZ_QUESTIONS.length;
    document.getElementById('quiz-question-text').innerText = q.question;
    document.getElementById('quiz-feedback').classList.add('hidden');
    
    const nextBtn = document.getElementById('quiz-next-btn');
    if (nextBtn) nextBtn.classList.add('hidden');

    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';

    q.options.forEach((optText, i) => {
        const btn = document.createElement('button');
        btn.onclick = () => answerQuiz(i);
        btn.className = `w-full p-3.5 rounded-xl border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800/80 text-left text-xs sm:text-sm text-slate-200 font-medium transition-all flex items-center justify-between`;
        btn.innerHTML = `
            <span>${optText}</span>
            <i class="fa-regular fa-circle text-slate-500"></i>
        `;
        optionsContainer.appendChild(btn);
    });

    startQuizTimer();
}

function startQuizTimer() {
    const timerDisplay = document.getElementById('quiz-timer');
    if (timerDisplay) timerDisplay.innerText = `${quizTimeLeft}s`;

    quizTimer = setInterval(() => {
        quizTimeLeft--;
        if (timerDisplay) timerDisplay.innerText = `${quizTimeLeft}s`;

        if (quizTimeLeft <= 0) {
            clearInterval(quizTimer);
            answerQuiz(-1);
        }
    }, 1000);
}

function answerQuiz(selectedIdx) {
    clearInterval(quizTimer);
    const q = QUIZ_QUESTIONS[currentQuizIdx];
    const optionsContainer = document.getElementById('quiz-options');
    const buttons = optionsContainer.querySelectorAll('button');

    buttons.forEach((btn, i) => {
        btn.disabled = true;
        if (i === q.correct) {
            btn.className = `w-full p-3.5 rounded-xl border border-emerald-500 bg-emerald-950/40 text-left text-xs sm:text-sm text-emerald-200 font-bold transition-all flex items-center justify-between`;
            btn.querySelector('i').className = `fa-solid fa-circle-check text-emerald-400`;
        } else if (i === selectedIdx && selectedIdx !== q.correct) {
            btn.className = `w-full p-3.5 rounded-xl border border-rose-500 bg-rose-950/40 text-left text-xs sm:text-sm text-rose-200 font-bold transition-all flex items-center justify-between`;
            btn.querySelector('i').className = `fa-solid fa-circle-xmark text-rose-400`;
        }
    });

    const feedbackBox = document.getElementById('quiz-feedback');
    feedbackBox.classList.remove('hidden');

    if (selectedIdx === q.correct) {
        feedbackBox.className = "p-4 rounded-xl text-xs text-left bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 space-y-1";
        feedbackBox.innerHTML = `<strong> Resposta Correta! (+50 pontos)</strong><p class="text-slate-300">${q.explanation}</p>`;
        score += 50;
        streak++;
    } else {
        feedbackBox.className = "p-4 rounded-xl text-xs text-left bg-rose-950/40 border border-rose-500/40 text-rose-300 space-y-1";
        feedbackBox.innerHTML = `<strong>${selectedIdx === -1 ? ' Tempo Esgotado!' : ' Incorreto!'}</strong><p class="text-slate-300">${q.explanation}</p>`;
        streak = 0;
    }

    updateStats();

    const nextBtn = document.getElementById('quiz-next-btn');
    const isLastQuestion = (currentQuizIdx === QUIZ_QUESTIONS.length - 1);

    if (isLastQuestion) {
        nextBtn.innerHTML = `Finalizar Teste <i class="fa-solid fa-flag-checkered ml-1"></i>`;
        nextBtn.className = `px-4 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-slate-950 transition-all shadow-md`;
    } else {
        nextBtn.innerHTML = `Próxima Pergunta <i class="fa-solid fa-chevron-right ml-1"></i>`;
        nextBtn.className = `px-4 py-2 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all`;
    }

    if (nextBtn) nextBtn.classList.remove('hidden');
}

function nextQuizQuestion() {
    if (currentQuizIdx < QUIZ_QUESTIONS.length - 1) {
        currentQuizIdx++;
        showQuizQuestion(currentQuizIdx);
    } else {
        openQuizCompletionModal();
    }
}

function openQuizCompletionModal() {
    const scoreDisplay = document.getElementById('modal-final-score');
    if (scoreDisplay) scoreDisplay.innerText = `${score} pts`;

    const modal = document.getElementById('quiz-completion-modal');
    if (modal) modal.classList.remove('hidden');

    if (typeof confetti === 'function') {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
}

function goToReferenceTab() {
    const modal = document.getElementById('quiz-completion-modal');
    if (modal) modal.classList.add('hidden');
    switchTab('reference');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openCasesCompletionModal() {
    const scoreDisplay = document.getElementById('cases-final-score');
    if (scoreDisplay) scoreDisplay.innerText = `${score} pts`;

    const modal = document.getElementById('cases-completion-modal');
    if (modal) modal.classList.remove('hidden');

    if (typeof confetti === 'function') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
}

function goToQuizTab() {
    const modal = document.getElementById('cases-completion-modal');
    if (modal) modal.classList.add('hidden');
    switchTab('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}