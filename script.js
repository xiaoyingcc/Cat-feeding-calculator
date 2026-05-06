const $ = id => document.getElementById(id);
let currentLifeStage = '1.2';
let currentWetUnit = '100g';
let currentDryUnit = '100g';
let currentLang = localStorage.getItem('catCalcLang') || 'en';

const i18n = {
    en: {
        title: '🐱 Cat Feeding Calculator',
        subtitle: 'Calculate the perfect daily portions for your cat',
        catProfiles: '🐾 Cat Profiles',
        catName: "Cat's Name",
        catNamePh: 'e.g. BaiBai',
        weight: 'Weight (kg)',
        lifeStage: 'Life Stage',
        neutered: '🏠 Neutered / Indoor',
        active: '🌳 Active / Outdoor',
        overweight: '⚖️ Overweight',
        kitten: '🍼 Kitten / Lactating',
        saveProfile: '💾 Save Profile',
        foodCalorieInfo: '🍽️ Food Calorie Info',
        wetFood: '🥫 Wet Food',
        dryFood: '🥣 Dry Food',
        selectSaved: 'Select Saved Food',
        enterManually: '— Enter manually —',
        foodName: 'Food Name',
        wetFoodPh: 'e.g. K9 Chicken Can',
        dryFoodPh: 'e.g. Farmina Adult',
        calories: 'Calories',
        saveFood: '💾 Save Food',
        ratio: '⚖️ Wet / Dry Ratio',
        allDry: '100% Dry',
        allWet: '100% Wet',
        enterWeight: 'Enter weight to see results',
        gramsWet: 'grams wet food',
        gramsDry: 'grams dry food',
        disclaimer: '⚠️ This calculator provides estimates only. Please consult your veterinarian.',
        newCat: '+ New Cat',
        sliderTpl: '{wet}% Wet — {dry}% Dry',
        calorieTpl: 'Daily need: {der} kcal (RER: {rer} kcal × {mult})',
    },
    zh: {
        title: '🐱 猫咪喂食计算器',
        subtitle: '计算猫咪每日最佳喂食量',
        catProfiles: '🐾 猫咪档案',
        catName: '猫咪名字',
        catNamePh: '例如：白白',
        weight: '体重 (kg)',
        lifeStage: '生命阶段',
        neutered: '🏠 绝育/室内猫',
        active: '🌳 活跃/户外猫',
        overweight: '⚖️ 超重',
        kitten: '🍼 幼猫/哺乳期',
        saveProfile: '💾 保存档案',
        foodCalorieInfo: '🍽️ 食物热量信息',
        wetFood: '🥫 湿粮',
        dryFood: '🥣 干粮',
        selectSaved: '选择已保存食物',
        enterManually: '— 手动输入 —',
        foodName: '食物名称',
        wetFoodPh: '例如：K9鸡肉罐头',
        dryFoodPh: '例如：法米纳成猫粮',
        calories: '热量',
        saveFood: '💾 保存食物',
        ratio: '⚖️ 湿粮/干粮比例',
        allDry: '100% 干粮',
        allWet: '100% 湿粮',
        enterWeight: '输入体重查看结果',
        gramsWet: '克 湿粮',
        gramsDry: '克 干粮',
        disclaimer: '⚠️ 本计算器仅供参考。在为猫咪进行重大饮食调整前，请咨询兽医。',
        newCat: '+ 新建猫咪',
        sliderTpl: '{wet}% 湿粮 — {dry}% 干粮',
        calorieTpl: '每日需求：{der} kcal（RER：{rer} kcal × {mult}）',
    }
};

function t(key) { return i18n[currentLang][key] || i18n.en[key] || key; }

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('catCalcLang', lang);
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.textContent.trim() === (lang === 'en' ? 'EN' : '中文')));
    applyI18n();
    calculate();
    renderProfiles();
    renderFoodDropdowns();
}

function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
}

function selectLifeStage(btn) {
    document.querySelectorAll('#lifeStageGroup .choice-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentLifeStage = btn.dataset.value;
    calculate();
}

function selectUnit(btn, type) {
    const group = $(type + 'UnitGroup');
    const oldUnit = type === 'wet' ? currentWetUnit : currentDryUnit;
    const newUnit = btn.dataset.value;
    group.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const input = $(type + 'Calories');
    const val = parseFloat(input.value);
    if (val && oldUnit !== newUnit) { input.value = oldUnit === '100g' ? Math.round(val * 10) : Math.round(val / 10); }
    if (type === 'wet') currentWetUnit = newUnit; else currentDryUnit = newUnit;
    calculate();
}

['catWeight', 'wetCalories', 'dryCalories', 'ratioSlider'].forEach(id => { $(id).addEventListener('input', calculate); });

function getKcalPerGram(type) {
    const def = type === 'wet' ? 110 : 380;
    let val = parseFloat($(type + 'Calories').value) || def;
    if ((type === 'wet' ? currentWetUnit : currentDryUnit) === 'kg') val = val / 10;
    return val / 100;
}

function calculate() {
    const weight = parseFloat($('catWeight').value);
    const multiplier = parseFloat(currentLifeStage);
    const wetRatio = parseInt($('ratioSlider').value) / 100;
    const dryRatio = 1 - wetRatio;
    $('sliderValue').textContent = t('sliderTpl').replace('{wet}', Math.round(wetRatio*100)).replace('{dry}', Math.round(dryRatio*100));
    if (!weight || weight <= 0) { $('wetGrams').textContent = '—'; $('dryGrams').textContent = '—'; $('calorieInfo').textContent = t('enterWeight'); return; }
    const rer = 70 * Math.pow(weight, 0.75);
    const der = rer * multiplier;
    const wetGrams = wetRatio > 0 ? (der * wetRatio) / getKcalPerGram('wet') : 0;
    const dryGrams = dryRatio > 0 ? (der * dryRatio) / getKcalPerGram('dry') : 0;
    const wetEl = $('wetGrams'); const dryEl = $('dryGrams');
    wetEl.classList.remove('animating'); dryEl.classList.remove('animating');
    void wetEl.offsetWidth;
    wetEl.textContent = Math.round(wetGrams) + 'g'; dryEl.textContent = Math.round(dryGrams) + 'g';
    wetEl.classList.add('animating'); dryEl.classList.add('animating');
    $('calorieInfo').textContent = t('calorieTpl').replace('{der}', Math.round(der)).replace('{rer}', Math.round(rer)).replace('{mult}', multiplier);
}

// Food Library
function getFoodLibrary() { return JSON.parse(localStorage.getItem('catFoodLibrary') || '[]'); }
function saveFoodLibrary(lib) { localStorage.setItem('catFoodLibrary', JSON.stringify(lib)); }

function renderFoodDropdowns() {
    const lib = getFoodLibrary();
    ['wet', 'dry'].forEach(type => {
        const sel = $(type + 'FoodSelect');
        const cur = sel.value;
        sel.innerHTML = '<option value="">' + t('enterManually') + '</option>';
        lib.filter(f => f.type === type).forEach(f => { const opt = document.createElement('option'); opt.value = f.name; opt.textContent = f.name + ' (' + f.calories + ' ' + (f.unit === 'kg' ? 'kcal/kg' : 'kcal/100g') + ')'; sel.appendChild(opt); });
        sel.value = cur || '';
    });
}

function saveFood(type) {
    const name = $(type + 'FoodName').value.trim();
    const calories = $(type + 'Calories').value;
    const unit = type === 'wet' ? currentWetUnit : currentDryUnit;
    if (!name) { alert('Please enter a food name.'); return; }
    if (!calories) { alert('Please enter a calorie value.'); return; }
    const lib = getFoodLibrary();
    const idx = lib.findIndex(f => f.name === name && f.type === type);
    const entry = { name, calories, unit, type };
    if (idx >= 0) lib[idx] = entry; else lib.push(entry);
    saveFoodLibrary(lib);
    renderFoodDropdowns();
    $(type + 'FoodSelect').value = name;
}

function loadFood(type) {
    const name = $(type + 'FoodSelect').value;
    if (!name) return;
    const food = getFoodLibrary().find(f => f.name === name && f.type === type);
    if (!food) return;
    $(type + 'FoodName').value = food.name;
    $(type + 'Calories').value = food.calories;
    const newUnit = food.unit || '100g';
    if (type === 'wet') currentWetUnit = newUnit; else currentDryUnit = newUnit;
    $(type + 'UnitGroup').querySelectorAll('.unit-btn').forEach(b => b.classList.toggle('active', b.dataset.value === newUnit));
    calculate();
}

// Cat Profiles
function getProfiles() { return JSON.parse(localStorage.getItem('catProfiles') || '[]'); }
function saveProfilesData(p) { localStorage.setItem('catProfiles', JSON.stringify(p)); }

function renderProfiles() {
    const profiles = getProfiles();
    const bar = $('profilesBar');
    bar.innerHTML = '';
    profiles.forEach((p, i) => {
        const chip = document.createElement('div');
        chip.className = 'profile-chip' + (p.active ? ' active' : '');
        chip.innerHTML = '<span onclick="loadProfile(' + i + ')">' + (p.name || 'Unnamed') + '</span><span class="delete-btn" onclick="handleDelete(event,' + i + ')">✕</span>';
        bar.appendChild(chip);
    });
    const btn = document.createElement('button');
    btn.className = 'btn btn-secondary';
    btn.textContent = t('newCat');
    btn.onclick = newProfile;
    bar.appendChild(btn);
}

function saveProfile() {
    const profiles = getProfiles();
    const name = $('catName').value.trim() || 'Unnamed';
    const data = { name, weight: $('catWeight').value, lifeStage: currentLifeStage, wetFoodName: $('wetFoodName').value, wetCalories: $('wetCalories').value, wetUnit: currentWetUnit, dryFoodName: $('dryFoodName').value, dryCalories: $('dryCalories').value, dryUnit: currentDryUnit, active: true };
    profiles.forEach(p => p.active = false);
    const idx = profiles.findIndex(p => p.name === name);
    if (idx >= 0) profiles[idx] = data; else profiles.push(data);
    saveProfilesData(profiles);
    renderProfiles();
}

function handleDelete(event, index) {
    event.stopPropagation();
    const btn = event.target;
    if (btn.classList.contains('confirming')) { deleteProfile(index); }
    else {
        btn.classList.add('confirming'); btn.textContent = 'Delete?';
        const revert = () => { btn.classList.remove('confirming'); btn.textContent = '✕'; document.removeEventListener('click', outsideClick); };
        const outsideClick = (e) => { if (e.target !== btn) revert(); };
        setTimeout(() => revert(), 3000);
        setTimeout(() => document.addEventListener('click', outsideClick), 10);
    }
}

function loadProfile(index) {
    const profiles = getProfiles();
    profiles.forEach(p => p.active = false);
    profiles[index].active = true;
    saveProfilesData(profiles);
    const p = profiles[index];
    $('catName').value = p.name || '';
    $('catWeight').value = p.weight || '';
    currentLifeStage = p.lifeStage || '1.2';
    document.querySelectorAll('#lifeStageGroup .choice-btn').forEach(b => b.classList.toggle('active', b.dataset.value === currentLifeStage));
    $('wetFoodName').value = p.wetFoodName || '';
    $('wetCalories').value = p.wetCalories || '';
    currentWetUnit = p.wetUnit || '100g';
    $('wetUnitGroup').querySelectorAll('.unit-btn').forEach(b => b.classList.toggle('active', b.dataset.value === currentWetUnit));
    $('wetFoodSelect').value = p.wetFoodName || '';
    $('dryFoodName').value = p.dryFoodName || '';
    $('dryCalories').value = p.dryCalories || '';
    currentDryUnit = p.dryUnit || '100g';
    $('dryUnitGroup').querySelectorAll('.unit-btn').forEach(b => b.classList.toggle('active', b.dataset.value === currentDryUnit));
    $('dryFoodSelect').value = p.dryFoodName || '';
    renderProfiles();
    calculate();
}

function deleteProfile(index) {
    const profiles = getProfiles();
    profiles.splice(index, 1);
    saveProfilesData(profiles);
    renderProfiles();
    if (profiles.length > 0) loadProfile(0);
}

function newProfile() {
    const profiles = getProfiles();
    profiles.forEach(p => p.active = false);
    saveProfilesData(profiles);
    $('catName').value = ''; $('catWeight').value = '';
    $('wetFoodName').value = ''; $('wetCalories').value = '';
    $('dryFoodName').value = ''; $('dryCalories').value = '';
    $('wetFoodSelect').value = ''; $('dryFoodSelect').value = '';
    currentLifeStage = '1.2'; currentWetUnit = '100g'; currentDryUnit = '100g';
    document.querySelectorAll('#lifeStageGroup .choice-btn').forEach(b => b.classList.toggle('active', b.dataset.value === '1.2'));
    $('wetUnitGroup').querySelectorAll('.unit-btn').forEach(b => b.classList.toggle('active', b.dataset.value === '100g'));
    $('dryUnitGroup').querySelectorAll('.unit-btn').forEach(b => b.classList.toggle('active', b.dataset.value === '100g'));
    renderProfiles();
    calculate();
}

// Init
document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.textContent.trim() === (currentLang === 'en' ? 'EN' : '中文')));
applyI18n();
renderFoodDropdowns();
renderProfiles();
(function() {
    const profiles = getProfiles();
    if (profiles.length > 0) { loadProfile(0); }
    else { $('catWeight').value = '4.5'; $('wetCalories').value = '110'; $('dryCalories').value = '380'; calculate(); }
})();
