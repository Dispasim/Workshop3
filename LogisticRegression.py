import pandas as pd
from flask import Flask, request, jsonify
import seaborn as sns
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score


df = sns.load_dataset("titanic")

#Les 'male' deviennent 0 et 'female' 1
df['sex'] = df['sex'].map({'male' : 0, 'female' : 1})

#Les 'S' deviennent 0, 'C' 1, 'Q' 2
df['embarked'] = df['embarked'].map({'S' : 0, 'C': 1, 'Q': 2})
df['embarked'] = df['embarked'].apply(lambda x: np.random.randint(0, 2) if np.isnan(x) else x)

df['embarked'] = df['embarked'].astype(int)

#Remplacons les colonnes où l'âge n'est pas donnée
df['age'] = df['age'].apply(lambda x: np.random.randint(0, 80) if np.isnan(x) else x)

df['who'] = df['who'].map({'man' : 0, 'woman': 1, 'child' : 2})
df['adult_male'] = df['adult_male'].replace({True: 0, False: 1})
df['alive'] = df['alive'].map({'yes' : 0, 'no': 1})
df['alone'] = df['alone'].replace({True: 0, False: 1})
df['class'] = df['class'].map({'First' : 1, 'Second': 2, 'Third': 3})
df['embark_town'] = df['embark_town'].map({'Southampton' : 0, 'Cherbourg' : 1, 'Queenstown': 2})
df['embark_town'] = df['embark_town'].apply(lambda x: np.random.randint(0,2) if pd.isna(x) else x)
df['deck'] = df['deck'].map({'C': 0, 'E': 1, 'G': 2, 'D': 3, 'A': 4, 'B': 5, 'F' : 6})
df['deck'] = df['deck'].apply(lambda x: np.random.randint(0,6) if pd.isna(x) else x)

df['embark_town'] = df['embark_town'].astype(int)

df['deck'] = df['deck'].map({'C': 0, 'E': 1, 'G': 2, 'D': 3, 'A': 4, 'B': 5, 'F' : 6})
df['deck'] = df['deck'].apply(lambda x: np.random.randint(0,6) if pd.isna(x) else x)

X = df.drop(columns=['survived'])
y = df['survived']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)


logisticregression = LogisticRegression()
logisticregression.fit(X_train, y_train)

y_pred = logisticregression.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print("La précision avec le modèle LogisticRegression est de :", accuracy)


app = Flask(__name__)

@app.route('/')
def hello_world():
    texte = 'Ceci est la page principale<br>'
    texte += '<br>'
    texte += 'Pour une prédiction veuillez entrer sous la forme par exemple :<br>'
    texte += 'http://127.0.0.1:5000//predict_survival?pclass=1&sex=0&age=25&sibsp=1&parch=0&fare=50&embarked=1&class=2&who=1&adult_male=0&deck=3&embark_town=1&alive=1&alone=0<br>'
    texte += "Le passager de l'exemple précédent est un non survivant par exemple et le suivant (lien ci-dessous est un survivant :<br>"
    texte += "http://127.0.0.1:5000//predict_survival?pclass=1&sex=1&age=38&sibsp=1&parch=0&fare=71.2833&embarked=1&class=1&who=1&adult_male=1&deck=4&embark_town=1&alive=0&alone=1<br>"
    texte += '<br>'
    texte += 'Vous pouvez changé les paramètres qui suivent les ='
    return texte

@app.route('/predict_survival', methods=['GET'])
def predict_survival():
    #http://127.0.0.1:5000//predict_survival?pclass=1&sex=0&age=25&sibsp=1&parch=0&fare=50&embarked=1&class=2&who=1&adult_male=0&deck=3&embark_town=1&alive=1&alone=0
    
    pclass = int(request.args.get('pclass'))
    sex = int(request.args.get('sex'))
    age = float(request.args.get('age'))
    sibsp = int(request.args.get('sibsp'))
    parch = int(request.args.get('parch'))
    fare = float(request.args.get('fare'))
    embarked = float(request.args.get('embarked'))
    classe = float(request.args.get('class'))
    who = float(request.args.get('who'))
    adult_male = float(request.args.get('adult_male'))
    deck = float(request.args.get('deck'))
    embark_town = float(request.args.get('embark_town'))
    alive = float(request.args.get('alive'))
    alone = float(request.args.get('alone'))

    input_data = np.array([[pclass, sex, age, sibsp, parch, fare, embarked, classe, who, adult_male, deck, embark_town, alive, alone]])

    prediction = logisticregression.predict(input_data)
    
    resultat = 'non survivant'
    variable = "0"
    
    if prediction == 1:
        resultat = 'survivant'
        variable = "1"
    
    texte = 'Le passager est un ' + resultat
    
    response_data = {
        'result': resultat,
        'prediction': variable
    }

    return jsonify(response_data)

    #return variable #Au lieu de texte pour préparer la question 2

#Question 3 (On s'est contenté que d'un exemple)
@app.route('/consensus/', methods=['get'])
def concensus():
  response_eliot = requests.get("http://127.0.0.1:5000//predict?pclass=1&sex=0&age=25&sibsp=1&parch=0&fare=50&body=10")
  data_eliot = response_eliot.json()
  predict_eliot = data_eliot["predict"]
  response_cecilia = requests.get("https://af06-2a01-e34-ec63-3510-c5b0-a263-d931-75a5.ngrok-free.app/predict_survival?pclass=1&sex=0&age=25&sibsp=1&parch=0&fare=50&embarked=1&class=2&who=1&adult_male=0&deck=3&embark_town=1&alive=1&alone=0")
  data_cecilia = response_cecilia.json()
  predict_cecilia = data_cecilia["prediction"]
        
  mean = np.mean([int(predict_cecilia),int(predict_eliot)])
  data = {'mean': str(mean)}
  return jsonify(data)

app.run(host="0.0.0.0")
