from main import create_app
from extensions import db
from models.user import User
from models.profile import Profile
from sqlalchemy import text, MetaData

app = create_app()

with app.app_context():
    with db.engine.connect() as conn:
        print('Disabling foreign key checks...')
        conn.execute(text('SET FOREIGN_KEY_CHECKS=0;'))
        print('Reflecting and dropping all tables...')
        meta = MetaData()
        meta.reflect(bind=conn)
        meta.drop_all(bind=conn)
        print('Enabling foreign key checks...')
        conn.execute(text('SET FOREIGN_KEY_CHECKS=1;'))
        print('Creating all tables...')
        db.create_all()
    print('Adding sample user...')
    user = User(username='testuser', email='test@example.com', password_hash='testpassword')
    db.session.add(user)
    db.session.commit()
    print('Database reset complete with sample user.') 