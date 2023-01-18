import { QLabel } from '@nodegui/nodegui';
declare class LyricItem extends QLabel {
    private lyricId;
    private fontMetrics;
    constructor(lyricId: number);
}
export default LyricItem;
