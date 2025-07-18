"""add_profile_image_columns_to_profiles

Revision ID: ca4e1db5eb1e
Revises: cfe9662a09f3
Create Date: 2025-07-17 04:59:30.766590

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ca4e1db5eb1e'
down_revision = 'cfe9662a09f3'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('profiles', sa.Column('profile_image', sa.String(255), nullable=True))
    op.add_column('profiles', sa.Column('profile_thumbnail', sa.String(255), nullable=True))


def downgrade():
    op.drop_column('profiles', 'profile_image')
    op.drop_column('profiles', 'profile_thumbnail')
