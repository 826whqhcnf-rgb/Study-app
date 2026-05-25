const { withEntitlementsPlist, withInfoPlist } = require('@expo/config-plugins');

const FAMILY_CONTROLS_ENTITLEMENT = 'com.apple.developer.family-controls';
const FAMILY_CONTROLS_USAGE_DESC = 'NSFamilyControlsUsageDescription';

const DEFAULT_USAGE_DESCRIPTION =
  'QuestLog uses Screen Time to shield distracting apps during Strict-Mode focus sessions and to gauge your daily screen budget.';

module.exports = function withFamilyControls(config, props) {
  const usageDescription =
    (props && props.usageDescription) || DEFAULT_USAGE_DESCRIPTION;

  config = withEntitlementsPlist(config, (cfg) => {
    cfg.modResults[FAMILY_CONTROLS_ENTITLEMENT] = true;
    return cfg;
  });

  config = withInfoPlist(config, (cfg) => {
    cfg.modResults[FAMILY_CONTROLS_USAGE_DESC] = usageDescription;
    return cfg;
  });

  return config;
};
