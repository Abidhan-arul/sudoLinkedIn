from main import create_app
from extensions import db

app = create_app()
with app.app_context():
    with db.engine.connect() as conn:
        conn.execute(db.text('ALTER TABLE profiles ADD COLUMN image_url VARCHAR(255)'))
        conn.commit()
    print('Image URL column added successfully') 