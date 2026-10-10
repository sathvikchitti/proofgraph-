/** The default skin: every element's own recipe, collected by name. One line per element. */
import { appWindowRecipe } from "../../ui/app-window/app-window.recipe";
import { arcsRecipe } from "../../ui/arcs/arcs.recipe";
import { composerRecipe } from "../../ui/composer/composer.recipe";
import { cropMarksRecipe } from "../../ui/crop-marks/crop-marks.recipe";
import { displayHeadingRecipe } from "../../ui/display-heading/display-heading.recipe";
import { hexBadgeRecipe } from "../../ui/hex-badge/hex-badge.recipe";
import { labelTabRecipe } from "../../ui/label-tab/label-tab.recipe";
import { pageFrameRecipe } from "../../ui/page-frame/page-frame.recipe";
import { paperGrainRecipe } from "../../ui/paper-grain/paper-grain.recipe";
import { quoteRecipe } from "../../ui/quote/quote.recipe";
import { terminalRecipe } from "../../ui/terminal/terminal.recipe";
import { marketingRecipe } from "../../blocks/marketing/marketing.recipe";
import { userMenuRecipe } from "../../blocks/user-menu/user-menu.recipe";
import { workspaceSwitcherRecipe } from "../../blocks/workspace-switcher/workspace-switcher.recipe";
import { appShellRecipe } from "../../layout/app-shell/app-shell.recipe";
import { breadcrumbsRecipe } from "../../layout/breadcrumbs/breadcrumbs.recipe";
import { docsLayoutRecipe } from "../../layout/docs-layout/docs-layout.recipe";
import { pageHeaderRecipe } from "../../layout/page-header/page-header.recipe";
import { splitViewRecipe } from "../../layout/split-view/split-view.recipe";
import { stackRecipe } from "../../layout/stack/stack.recipe";
import { accordionRecipe } from "../../ui/accordion/accordion.recipe";
import { alertRecipe } from "../../ui/alert/alert.recipe";
import { animatedNumberRecipe } from "../../ui/animated-number/animated-number.recipe";
import { areaChartRecipe } from "../../ui/area-chart/area-chart.recipe";
import { asyncBoundaryRecipe } from "../../ui/async-boundary/async-boundary.recipe";
import { authCardRecipe } from "../../ui/auth-card/auth-card.recipe";
import { avatarRecipe } from "../../ui/avatar/avatar.recipe";
import { badgeRecipe } from "../../ui/badge/badge.recipe";
import { bannerRecipe } from "../../ui/banner/banner.recipe";
import { barChartRecipe } from "../../ui/bar-chart/bar-chart.recipe";
import { buttonRecipe } from "../../ui/button/button.recipe";
import { calendarHeatmapRecipe } from "../../ui/calendar-heatmap/calendar-heatmap.recipe";
import { cardRecipe } from "../../ui/card/card.recipe";
import { chartCardRecipe } from "../../ui/chart-card/chart-card.recipe";
import { chartFrameRecipe } from "../../ui/chart-frame/chart-frame.recipe";
import { chatThreadRecipe } from "../../ui/chat-thread/chat-thread.recipe";
import { checkboxRecipe } from "../../ui/checkbox/checkbox.recipe";
import { checklistRecipe } from "../../ui/checklist/checklist.recipe";
import { codeInputRecipe } from "../../ui/code-input/code-input.recipe";
import { codeViewerRecipe } from "../../ui/code-viewer/code-viewer.recipe";
import { codeRecipe } from "../../ui/code/code.recipe";
import { comboboxRecipe } from "../../ui/combobox/combobox.recipe";
import { commandPaletteRecipe } from "../../ui/command-palette/command-palette.recipe";
import { confirmDialogRecipe } from "../../ui/confirm-dialog/confirm-dialog.recipe";
import { connectAccountCardRecipe } from "../../ui/connect-account-card/connect-account-card.recipe";
import { contextMenuRecipe } from "../../ui/context-menu/context-menu.recipe";
import { copyFieldRecipe } from "../../ui/copy-field/copy-field.recipe";
import { countdownTimerRecipe } from "../../ui/countdown-timer/countdown-timer.recipe";
import { csvImporterRecipe } from "../../ui/csv-importer/csv-importer.recipe";
import { dataTableRecipe } from "../../ui/data-table/data-table.recipe";
import { datePickerRecipe } from "../../ui/date-picker/date-picker.recipe";
import { dateRangePickerRecipe } from "../../ui/date-range-picker/date-range-picker.recipe";
import { descriptionListRecipe } from "../../ui/description-list/description-list.recipe";
import { dialogRecipe } from "../../ui/dialog/dialog.recipe";
import { diffViewerRecipe } from "../../ui/diff-viewer/diff-viewer.recipe";
import { donutRecipe } from "../../ui/donut/donut.recipe";
import { dropdownMenuRecipe } from "../../ui/dropdown-menu/dropdown-menu.recipe";
import { emptyStateRecipe } from "../../ui/empty-state/empty-state.recipe";
import { entityHeaderRecipe } from "../../ui/entity-header/entity-header.recipe";
import { errorPageRecipe } from "../../ui/error-page/error-page.recipe";
import { errorStateRecipe } from "../../ui/error-state/error-state.recipe";
import { eventFeedRecipe } from "../../ui/event-feed/event-feed.recipe";
import { fieldRecipe } from "../../ui/field/field.recipe";
import { fileDropzoneRecipe } from "../../ui/file-dropzone/file-dropzone.recipe";
import { filterBarRecipe } from "../../ui/filter-bar/filter-bar.recipe";
import { formLayoutRecipe } from "../../ui/form-layout/form-layout.recipe";
import { gatesRecipe } from "../../ui/gates/gates.recipe";
import { graphViewRecipe } from "../../ui/graph-view/graph-view.recipe";
import { headingRecipe } from "../../ui/heading/heading.recipe";
import { heatmapRecipe } from "../../ui/heatmap/heatmap.recipe";
import { hoverCardRecipe } from "../../ui/hover-card/hover-card.recipe";
import { iconRecipe } from "../../ui/icon/icon.recipe";
import { inlineEditRecipe } from "../../ui/inline-edit/inline-edit.recipe";
import { inputRecipe } from "../../ui/input/input.recipe";
import { jsonViewerRecipe } from "../../ui/json-viewer/json-viewer.recipe";
import { kanbanBoardRecipe } from "../../ui/kanban-board/kanban-board.recipe";
import { kbdRecipe } from "../../ui/kbd/kbd.recipe";
import { lineChartRecipe } from "../../ui/line-chart/line-chart.recipe";
import { linkRecipe } from "../../ui/link/link.recipe";
import { listRecipe } from "../../ui/list/list.recipe";
import { markdownRecipe } from "../../ui/markdown/markdown.recipe";
import { meterRecipe } from "../../ui/meter/meter.recipe";
import { multiSelectRecipe } from "../../ui/multi-select/multi-select.recipe";
import { notificationListRecipe } from "../../ui/notification-list/notification-list.recipe";
import { paginationRecipe } from "../../ui/pagination/pagination.recipe";
import { percentileRecipe } from "../../ui/percentile/percentile.recipe";
import { permissionMatrixRecipe } from "../../ui/permission-matrix/permission-matrix.recipe";
import { popoverRecipe } from "../../ui/popover/popover.recipe";
import { pricingTableRecipe } from "../../ui/pricing-table/pricing-table.recipe";
import { profileCardRecipe } from "../../ui/profile-card/profile-card.recipe";
import { progressRecipe } from "../../ui/progress/progress.recipe";
import { questionCardRecipe } from "../../ui/question-card/question-card.recipe";
import { radioGroupRecipe } from "../../ui/radio-group/radio-group.recipe";
import { rubricResultRecipe } from "../../ui/rubric-result/rubric-result.recipe";
import { scoreBreakdownRecipe } from "../../ui/score-breakdown/score-breakdown.recipe";
import { searchInputRecipe } from "../../ui/search-input/search-input.recipe";
import { segmentedControlRecipe } from "../../ui/segmented-control/segmented-control.recipe";
import { selectRecipe } from "../../ui/select/select.recipe";
import { separatorRecipe } from "../../ui/separator/separator.recipe";
import { sheetRecipe } from "../../ui/sheet/sheet.recipe";
import { skeletonRecipe } from "../../ui/skeleton/skeleton.recipe";
import { sliderRecipe } from "../../ui/slider/slider.recipe";
import { sparklineRecipe } from "../../ui/sparkline/sparkline.recipe";
import { spinnerRecipe } from "../../ui/spinner/spinner.recipe";
import { statCardRecipe } from "../../ui/stat-card/stat-card.recipe";
import { statusDotRecipe } from "../../ui/status-dot/status-dot.recipe";
import { stepperRecipe } from "../../ui/stepper/stepper.recipe";
import { switchRecipe } from "../../ui/switch/switch.recipe";
import { tabsRecipe } from "../../ui/tabs/tabs.recipe";
import { tagInputRecipe } from "../../ui/tag-input/tag-input.recipe";
import { tagRecipe } from "../../ui/tag/tag.recipe";
import { textRecipe } from "../../ui/text/text.recipe";
import { textareaRecipe } from "../../ui/textarea/textarea.recipe";
import { themeToggleRecipe } from "../../ui/theme-toggle/theme-toggle.recipe";
import { timelineRecipe } from "../../ui/timeline/timeline.recipe";
import { toastRecipe } from "../../ui/toast/toast.recipe";
import { tooltipRecipe } from "../../ui/tooltip/tooltip.recipe";
import { treeViewRecipe } from "../../ui/tree-view/tree-view.recipe";
import { valueChangeRecipe } from "../../ui/value-change/value-change.recipe";
import { visuallyHiddenRecipe } from "../../ui/visually-hidden/visually-hidden.recipe";
import { voiceRecorderRecipe } from "../../ui/voice-recorder/voice-recorder.recipe";

export const defaultSkin = {
  appWindow: appWindowRecipe,
  arcs: arcsRecipe,
  composer: composerRecipe,
  cropMarks: cropMarksRecipe,
  displayHeading: displayHeadingRecipe,
  hexBadge: hexBadgeRecipe,
  labelTab: labelTabRecipe,
  pageFrame: pageFrameRecipe,
  paperGrain: paperGrainRecipe,
  quote: quoteRecipe,
  terminal: terminalRecipe,
  accordion: accordionRecipe,
  alert: alertRecipe,
  animatedNumber: animatedNumberRecipe,
  appShell: appShellRecipe,
  areaChart: areaChartRecipe,
  asyncBoundary: asyncBoundaryRecipe,
  authCard: authCardRecipe,
  avatar: avatarRecipe,
  badge: badgeRecipe,
  banner: bannerRecipe,
  barChart: barChartRecipe,
  breadcrumbs: breadcrumbsRecipe,
  button: buttonRecipe,
  calendarHeatmap: calendarHeatmapRecipe,
  card: cardRecipe,
  chartCard: chartCardRecipe,
  chartFrame: chartFrameRecipe,
  chatThread: chatThreadRecipe,
  checkbox: checkboxRecipe,
  checklist: checklistRecipe,
  code: codeRecipe,
  codeInput: codeInputRecipe,
  codeViewer: codeViewerRecipe,
  combobox: comboboxRecipe,
  commandPalette: commandPaletteRecipe,
  confirmDialog: confirmDialogRecipe,
  connectAccountCard: connectAccountCardRecipe,
  contextMenu: contextMenuRecipe,
  copyField: copyFieldRecipe,
  countdownTimer: countdownTimerRecipe,
  csvImporter: csvImporterRecipe,
  dataTable: dataTableRecipe,
  datePicker: datePickerRecipe,
  dateRangePicker: dateRangePickerRecipe,
  descriptionList: descriptionListRecipe,
  dialog: dialogRecipe,
  diffViewer: diffViewerRecipe,
  docsLayout: docsLayoutRecipe,
  donut: donutRecipe,
  dropdownMenu: dropdownMenuRecipe,
  emptyState: emptyStateRecipe,
  entityHeader: entityHeaderRecipe,
  errorPage: errorPageRecipe,
  errorState: errorStateRecipe,
  eventFeed: eventFeedRecipe,
  field: fieldRecipe,
  fileDropzone: fileDropzoneRecipe,
  filterBar: filterBarRecipe,
  formLayout: formLayoutRecipe,
  gates: gatesRecipe,
  graphView: graphViewRecipe,
  heading: headingRecipe,
  heatmap: heatmapRecipe,
  hoverCard: hoverCardRecipe,
  icon: iconRecipe,
  inlineEdit: inlineEditRecipe,
  input: inputRecipe,
  jsonViewer: jsonViewerRecipe,
  kanbanBoard: kanbanBoardRecipe,
  kbd: kbdRecipe,
  lineChart: lineChartRecipe,
  link: linkRecipe,
  list: listRecipe,
  markdown: markdownRecipe,
  marketing: marketingRecipe,
  meter: meterRecipe,
  multiSelect: multiSelectRecipe,
  notificationList: notificationListRecipe,
  pageHeader: pageHeaderRecipe,
  pagination: paginationRecipe,
  percentile: percentileRecipe,
  permissionMatrix: permissionMatrixRecipe,
  popover: popoverRecipe,
  pricingTable: pricingTableRecipe,
  profileCard: profileCardRecipe,
  progress: progressRecipe,
  questionCard: questionCardRecipe,
  radioGroup: radioGroupRecipe,
  rubricResult: rubricResultRecipe,
  scoreBreakdown: scoreBreakdownRecipe,
  searchInput: searchInputRecipe,
  segmentedControl: segmentedControlRecipe,
  select: selectRecipe,
  separator: separatorRecipe,
  sheet: sheetRecipe,
  skeleton: skeletonRecipe,
  slider: sliderRecipe,
  sparkline: sparklineRecipe,
  spinner: spinnerRecipe,
  splitView: splitViewRecipe,
  stack: stackRecipe,
  statCard: statCardRecipe,
  statusDot: statusDotRecipe,
  stepper: stepperRecipe,
  switch: switchRecipe,
  tabs: tabsRecipe,
  tag: tagRecipe,
  tagInput: tagInputRecipe,
  text: textRecipe,
  textarea: textareaRecipe,
  themeToggle: themeToggleRecipe,
  timeline: timelineRecipe,
  toast: toastRecipe,
  tooltip: tooltipRecipe,
  treeView: treeViewRecipe,
  userMenu: userMenuRecipe,
  valueChange: valueChangeRecipe,
  visuallyHidden: visuallyHiddenRecipe,
  voiceRecorder: voiceRecorderRecipe,
  workspaceSwitcher: workspaceSwitcherRecipe,
};
