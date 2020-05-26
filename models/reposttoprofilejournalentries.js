'use strict';
module.exports = (sequelize, DataTypes) => {
  const repost_to_profile_journal_entries = sequelize.define('repost_to_profile_journal_entries', {
    journalEntriesId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {});
  repost_to_profile_journal_entries.associate = function(models) {
    repost_to_profile_journal_entries.belongsTo(models.users, { foreignKey: 'userId', as: 'user' });
    repost_to_profile_journal_entries.belongsTo(models.journal, { foreignKey: 'journalEntriesId', as: 'JournalEntries' })
  };
  return repost_to_profile_journal_entries;
};