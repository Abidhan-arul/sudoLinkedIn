"""add_about_skills_email_to_profile

Revision ID: 2aae85052bd6
Revises: ca4e1db5eb1e
Create Date: 2025-07-17 06:50:45.501992

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2aae85052bd6'
down_revision = 'ca4e1db5eb1e'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('profiles', sa.Column('about', sa.Text(), nullable=True))
    op.add_column('profiles', sa.Column('skills', sa.Text(), nullable=True))
    op.add_column('profiles', sa.Column('email', sa.String(120), nullable=True))


def downgrade():
    op.drop_column('profiles', 'about')
    op.drop_column('profiles', 'skills')
    op.drop_column('profiles', 'email')
