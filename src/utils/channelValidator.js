function isAllowedChannel(channelId) {
  const allowedChannels = process.env.SLACK_ALLOWED_CHANNELS.split(',');
  return allowedChannels.includes(channelId);
}

module.exports = { isAllowedChannel };