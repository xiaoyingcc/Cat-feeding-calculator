const $ = id => document.getElementById(id);
let currentLifeStage = '1.2';
let currentWetUnit = '100g';
let currentDryUnit = '100g';

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
    if (val && oldUnit !== newUnit) {
        input.value = oldUnit === '100g' ? Math.round(val * 10) : Math.round(val / 10);
    }
    if (type === 'wet') currentWetUnit = newUnit;
    else currentDryUnit = newUnit;
    calculate();
}

['catWeight', 'wetCalories', 'dryCalories', 'ratioSlider'].forEach(id => {
    $(id).addEventListener('input', calculate);
});

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
    $('sliderValue').textContent = `${Math.round(wetRatio*100)}% Wet — ${Math.round(dryRatio*100)}% Dry`;
    if (!weight || weight <= 0) {
        $('wetGrams').textContent = '—';
        $('dryGrams').textContent = '—';
        $('calorieInfo').textContent = 'Enter weight to see results';
        return;
    }
    const rer = 70 * Math.pow(weight, 0.75);
    const der = rer * multiplier;
    const wetGrams = wetRatio > 0 ? (der * wetRatio) / getKcalPerGram('wet') : 0;
    const dryGrams = dryRatio > 0 ? (der * dryRatio) / getKcalPerGram('dry') : 0;
    $('wetGrams').textContent = Math.round(wetGrams) + 'g';
    $('dryGrams').textContent = Math.round(dryGrams) + 'g';
    $('calorieInfo').textContent = `Daily need: ${Math.round(der)} kcal (RER: ${Math.round(rer)} kcal × ${multiplier})`;
}

// Food Library
function getFoodLibrary() { return JSON.parse(localStorage.getItem('catFoodLibrary') || '[]'); }
function saveFoodLibrary(lib) { localStorage.setItem('catFoodLibrary', JSON.stringify(lib)); }

function renderFoodDropdowns() {
    const lib = getFoodLibrary();
    ['wet', 'dry'].forEach(type => {
        const sel = $(type + 'FoodSelect');
        const cur = sel.value;
        sel.innerHTML = '<option value="">— Enter manually —</option>';
        lib.filter(f => f.type === type).forEach(f => {
            const opt = document.createElement('option');
            opt.value = f.name;
            opt.textContent = `${f.name} (${f.calories} ${f.unit === 'kg' ? 'kcal/kg' : 'kcal/100g'})`;
            sel.appendChild(opt);
        });
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
        chip.innerHTML = `<span onclick="loadProfile(${i})">${p.name || 'Unnamed'}</span><span class="delete-btn" onclick="deleteProfile(${i})">✕</span>`;
        bar.appendChild(chip);
    });
    const btn = document.createElement('button');
    btn.className = 'btn btn-secondary';
    btn.textContent = '+ New Cat';
    btn.onclick = newProfile;
    bar.appendChild(btn);
}

function saveProfile() {
    const profiles = getProfiles();
    const name = $('catName').value.trim() || 'Unnamed';
    const data = {
        name, weight: $('catWeight').value, lifeStage: currentLifeStage,
        wetFoodName: $('wetFoodName').value, wetCalories: $('wetCalories').value, wetUnit: currentWetUnit,
        dryFoodName: $('dryFoodName').value, dryCalories: $('dryCalories').value, dryUnit: currentDryUnit,
        active: true
    };
    profiles.forEach(p => p.active = false);
    const idx = profiles.findIndex(p => p.name === name);
    if (idx >= 0) profiles[idx] = data; else profiles.push(data);
    saveProfilesData(profiles);
    renderProfiles();
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
renderFoodDropdowns();
renderProfiles();
(function() {
    const profiles = getProfiles();
    if (profiles.length > 0) { loadProfile(0); }
    else { $('catWeight').value = '4.5'; $('wetCalories').value = '110'; $('dryCalories').value = '380'; calculate(); }
})();
