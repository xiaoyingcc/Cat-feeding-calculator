const $ = id => document.getElementById(id);
let currentLifeStage = '1.2';
let currentWetUnit = '100g';
let currentDryUnit = '100g';
let currentLang = localStorage.getItem('catCalcLang') || 'en';

const i18n = {
    en: {
        title: '\u{1F431} Cat Feeding Calculator',
        subtitle: 'Calculate the purr-fect daily portions for your furball',
        catProfiles: '\u{1F43E} Cat Profiles',
        catName: "Cat's Name",
        catNamePh: 'e.g., BaiBai',
        weight: 'Weight (kg)',
        weightPh: 'e.g., 4.2',
        lifeStage: 'Life Stage',
        neutered: '\u{1F3E0} Neutered / Indoor',
        active: '\u{1F333} Active / Outdoor',
        overweight: '\u2696\uFE0F Overweight',
        kitten: '\u{1F37C} Kitten / Lactating',
        saveProfile: '\u2764\uFE0F Save this Cutie',
        foodCalorieInfo: '\u{1F37D}\uFE0F Food Calorie Info',
        wetFood: '\u{1F96B} Wet Food',
        dryFood: '\u{1F963} Dry Food',
        selectSaved: 'Select Saved Food',
        enterManually: '\u2014 Enter manually \u2014',
        foodName: 'Food Name',
        wetFoodPh: 'e.g., Fancy Feast Tuna',
        dryFoodPh: 'e.g., Royal Canin Indoor',
        calories: 'Calories',
        saveFood: '\u2728 Save Food',
        ratio: '\u2696\uFE0F Wet / Dry Ratio',
        allDry: '100% Dry',
        allWet: '100% Wet',
        enterWeight: 'Enter weight to see the purr-fect plan! \u{1F43E}',
        gramsWet: 'grams wet food',
        gramsDry: 'grams dry food',
        disclaimer: '\u26A0\uFE0F This calculator provides estimates only. Please consult your vet before making significant dietary changes.',
        newCat: '+ New Cat',
        sliderTpl: '{wet}% Wet \u2014 {dry}% Dry',
        calorieTpl: '\u{1F43E} Purr-fect plan! Daily need: {der} kcal (RER: {rer} kcal \u00D7 {mult})',
    },
    zh: {
        title: '\u{1F431} \u732B\u54AA\u5582\u98DF\u8BA1\u7B97\u5668',
        subtitle: '\u4E3A\u4F60\u7684\u6BDB\u5B69\u5B50\u8BA1\u7B97\u6BCF\u65E5\u6700\u4F73\u5582\u98DF\u91CF',
        catProfiles: '\u{1F43E} \u732B\u54AA\u6863\u6848',
        catName: '\u732B\u54AA\u540D\u5B57',
        catNamePh: '\u4F8B\u5982\uFF1A\u55B5\u4E3B\u5E2D',
        weight: '\u4F53\u91CD (kg)',
        weightPh: '\u4F60\u5BB6\u6BDB\u7403\u6709\u591A\u91CD\uFF1F',
        lifeStage: '\u751F\u547D\u9636\u6BB5',
        neutered: '\u{1F3E0} \u7EDD\u80B2/\u5BA4\u5185\u732B',
        active: '\u{1F333} \u6D3B\u8DC3/\u6237\u5916\u732B',
        overweight: '\u2696\uFE0F \u8D85\u91CD',
        kitten: '\u{1F37C} \u5E7C\u732B/\u54FA\u4E73\u671F',
        saveProfile: '\u2764\uFE0F \u4FDD\u5B58\u8FD9\u53EA\u5C0F\u53EF\u7231',
        foodCalorieInfo: '\u{1F37D}\uFE0F \u98DF\u7269\u70ED\u91CF\u4FE1\u606F',
        wetFood: '\u{1F96B} \u6E7F\u7CAE',
        dryFood: '\u{1F963} \u5E72\u7CAE',
        selectSaved: '\u9009\u62E9\u5DF2\u4FDD\u5B58\u98DF\u7269',
        enterManually: '\u2014 \u624B\u52A8\u8F93\u5165 \u2014',
        foodName: '\u98DF\u7269\u540D\u79F0',
        wetFoodPh: '\u4F8B\u5982\uFF1A\u5E0C\u5B9D\u91D1\u67AA\u9C7C\u7F50\u5934',
        dryFoodPh: '\u4F8B\u5982\uFF1A\u7687\u5BB6\u5BA4\u5185\u732B\u7CAE',
        calories: '\u70ED\u91CF',
        saveFood: '\u2728 \u4FDD\u5B58\u98DF\u7269',
        ratio: '\u2696\uFE0F \u6E7F\u7CAE/\u5E72\u7CAE\u6BD4\u4F8B',
        allDry: '100% \u5E72\u7CAE',
        allWet: '100% \u6E7F\u7CAE',
        enterWeight: '\u8F93\u5165\u4F53\u91CD\uFF0C\u83B7\u53D6\u55B5\u661F\u4EBA\u7684\u5B8C\u7F8E\u98DF\u8C31\uFF01\u{1F43E}',
        gramsWet: '\u514B \u6E7F\u7CAE',
        gramsDry: '\u514B \u5E72\u7CAE',
        disclaimer: '\u26A0\uFE0F \u672C\u8BA1\u7B97\u5668\u4EC5\u4F9B\u53C2\u8003\u3002\u5728\u4E3A\u732B\u54AA\u8FDB\u884C\u91CD\u5927\u996E\u98DF\u8C03\u6574\u524D\uFF0C\u8BF7\u54A8\u8BE2\u517D\u533B\u3002',
        newCat: '+ \u65B0\u5EFA\u732B\u54AA',
        sliderTpl: '{wet}% \u6E7F\u7CAE \u2014 {dry}% \u5E72\u7CAE',
        calorieTpl: '\u{1F43E} \u5B8C\u7F8E\u98DF\u8C31\uFF01\u6BCF\u65E5\u9700\u6C42\uFF1A{der} kcal\uFF08RER\uFF1A{rer} kcal \u00D7 {mult}\uFF09',
    }
};

function t(key) { return i18n[currentLang][key] || i18n.en[key] || key; }

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('catCalcLang', lang);
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.textContent.trim() === (lang === 'en' ? 'EN' : '\u4E2D\u6587')));
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
    if (!weight || weight <= 0) { $('wetGrams').textContent = '\u2014'; $('dryGrams').textContent = '\u2014'; $('calorieInfo').textContent = t('enterWeight'); return; }
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
        chip.innerHTML = '<span onclick="loadProfile(' + i + ')">' + (p.name || 'Unnamed') + '</span><span class="delete-btn" onclick="handleDelete(event,' + i + ')">\u2715</span>';
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
        const revert = () => { btn.classList.remove('confirming'); btn.textContent = '\u2715'; document.removeEventListener('click', outsideClick); };
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
document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.textContent.trim() === (currentLang === 'en' ? 'EN' : '\u4E2D\u6587')));
applyI18n();
renderFoodDropdowns();
renderProfiles();
(function() {
    const profiles = getProfiles();
    if (profiles.length > 0) { loadProfile(0); }
    else { $('catWeight').value = '4.5'; $('wetCalories').value = '110'; $('dryCalories').value = '380'; calculate(); }
})();
