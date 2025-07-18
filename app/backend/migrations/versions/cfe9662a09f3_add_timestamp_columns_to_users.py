"""add_timestamp_columns_to_users

Revision ID: cfe9662a09f3
Revises: 32902e091c20
Create Date: 2025-07-17 00:32:16.125919

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'cfe9662a09f3'
down_revision = '32902e091c20'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('updated_at', sa.DateTime(), nullable=True))


def downgrade():
    op.drop_column('users', 'created_at')
    op.drop_column('users', 'updated_at')
