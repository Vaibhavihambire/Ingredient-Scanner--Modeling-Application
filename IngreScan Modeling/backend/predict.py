from flask import Blueprint, request, jsonify
import pickle
import numpy as np
import pandas as pd
import re

predict_bp = Blueprint('predict', __name__)

# Load model, scaler, and additive explanations
model = pickle.load(open('risk_predictor_model.pkl', 'rb'))
scaler = pickle.load(open('scaler.pkl', 'rb'))
additive_expl_dict = pickle.load(open('additive_expl_dict.pkl', 'rb'))

def extract_features(ingredients_text, user_pref):
    harmful_keywords = [
        'e950', 'acesulfame potassium', 'acesulfame k',
        'e951', 'aspartame', 'e952', 'cyclamate',
        'e954', 'saccharin', 'e955', 'sucralose',
        'e960', 'steviol glycosides', 'e211', 'sodium benzoate',
        'e250', 'sodium nitrite', 'e251', 'sodium nitrate',
        'e320', 'bha', 'e321', 'bht', 'e330', 'citric acid',
        'e338', 'phosphoric acid', 'e621', 'monosodium glutamate', 'msg',
        'e627', 'disodium guanylate', 'e631', 'disodium inosinate',
        'e102', 'tartrazine', 'e110', 'sunset yellow',
        'e122', 'carmoisine', 'e124', 'ponceau 4r',
        'e129', 'allura red', 'e132', 'indigo carmine',
        'e133', 'brilliant blue', 'e143', 'fast green fcf',
        'e407', 'carrageenan', 'e466', 'carboxymethylcellulose',
        'e924', 'potassium bromate', 'e443', 'brominated vegetable oil',
        'caffeine', 'artificial flavor', 'artificial flavour',
        'artificial color', 'artificial colour',
        'high fructose corn syrup', 'refined sugar'
    ]

    ingredients_text_lower = ingredients_text.lower()
    count = sum(1 for word in harmful_keywords if word in ingredients_text_lower)

    def high_salt(text):
        return int(bool(re.search(r'\b(sodium chloride|salt|sodium)\b', text, re.I)))

    def high_sugar(text):
        return int(bool(re.search(r'\b(sugar|glucose|fructose|sucrose|corn syrup)\b', text, re.I)))

    non_harmful_ingredients = ['water', 'calcium', 'magnesium', 'potassium']
    is_safe = all(i in ingredients_text_lower for i in non_harmful_ingredients)

    high_salt_val = 0 if is_safe else high_salt(ingredients_text)
    high_sugar_val = 0 if is_safe else high_sugar(ingredients_text)

    tokens = re.split(r'[\n,;]+', ingredients_text)
    cleaned_tokens = [t.strip() for t in tokens if t.strip()]
    complexity = len(cleaned_tokens)

    risk_score = 0
    if count > 0: risk_score += 1
    if user_pref.get('high_salt') and high_salt_val: risk_score += 1
    elif high_salt_val: risk_score += 0.5
    if user_pref.get('high_sugar') and high_sugar_val: risk_score += 1
    elif high_sugar_val: risk_score += 0.5
    if complexity > 10: risk_score += 0.5
    elif 6 <= complexity <= 10: risk_score += 0.25

    if risk_score <= 0.5:
        risk_level = 'Low'
    elif risk_score <= 1.5:
        risk_level = 'Moderate'
    else:
        risk_level = 'High'

    return np.array([[count, high_sugar_val, min(complexity, 10), high_salt_val]]), risk_level

@predict_bp.route('/predict', methods=['POST'])
def predict_risk():
    data = request.get_json()
    ingredients = data.get('ingredients', '').lower().strip()
    user_pref = data.get('user', {'high_salt': False, 'high_sugar': False})

    ingredients_cleaned = re.sub(r'[^a-z0-9,\s]', '', ingredients.lower())
    tokens = set([token.strip() for token in ingredients_cleaned.split(',') if token.strip()])

    safe_words = {'water', 'treated water', 'minerals', 'salts of calcium', 'calcium', 'magnesium', 'potassium'}
    if tokens.issubset(safe_words):
        return jsonify({
            "risk_level": "Low",
            "explanations": ["All ingredients are recognized as safe."]
        })

    try:
        features, custom_risk_level = extract_features(ingredients, user_pref)
        df = pd.DataFrame(features, columns=['Harmful_Additive_Count', 'High_Sugar', 'Ingredient_Complexity', 'High_Salt'])
        features_scaled = scaler.transform(df)
        prediction = model.predict(features_scaled)[0]

        ingredients_lower = ingredients.lower()
        explanations_found = [
            explanation for keyword, explanation in additive_expl_dict.items()
            if re.search(r'\b' + re.escape(keyword.lower()) + r'\b', ingredients_lower)
        ]

        if not explanations_found and df['Harmful_Additive_Count'].iloc[0] > 0:
            explanations_found.append("Detected harmful additives based on ingredient keywords.")

        return jsonify({
            "risk_level": custom_risk_level,
            "explanations": explanations_found if explanations_found else ["No harmful additives found."]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
