export interface News {
  uid: string;
  title: string;
  audioUrl: string;
}

export type PlayType = 'start' | 'end' | 'play' | 'pause';

export interface PlayTask {
  pttype: PlayType;
  ptduration: number;
  ptstart?: number;
  ptspeed?: number;
  pttext?: string;
}

export type AudioSegment = {
  start: number;
  duration: number;
  text: string;
};

export class PlayModel {
  audioUrl: string;
  duration: number;
  playTaskList: PlayTask[];
  playTaskIndex: number;
  segments: AudioSegment[];

  constructor() {
    this.audioUrl = '';
    this.duration = 0;
    this.playTaskList = [];
    this.playTaskIndex = 0;
    this.segments = [];
  }

  async initSegment(uid: string) {
    this.segments = [];

    const resp = await fetch('https://moosephotoprint.com/npr/get/' + uid, {
      method: 'GET',
      redirect: 'follow',
    });

    const data = await resp.json();
    this.audioUrl = data.audio2;

    if (data.transcript) {
      let lastEnd = 0;
      for (const t of data.transcript) {
        for (const s of t.sentences) {
          this.segments.push({
            start: lastEnd,
            duration: s.end - lastEnd,
            text: s.text,
          });
          lastEnd = s.end;
        }
      }
      this.duration = lastEnd;
    }
  }

  addPlayTask(
    pttype: PlayType,
    ptduration: number,
    ptstart?: number,
    ptspeed?: number,
    pttext?: string
  ) {
    this.playTaskList.push({ pttype, ptduration, ptstart, ptspeed, pttext });
  }

  firstPlayTask(): PlayTask {
    this.playTaskIndex = 0;
    return this.playTaskList[this.playTaskIndex];
  }

  nextPlayTask(): PlayTask {
    if (this.playTaskIndex < this.playTaskList.length - 1) {
      this.playTaskIndex += 1;
    }
    return this.playTaskList[this.playTaskIndex];
  }

  previousPlayTask(): PlayTask {
    if (this.playTaskIndex > 0) {
      this.playTaskIndex--;
      if (this.playTaskList[this.playTaskIndex].pttype === 'pause')
        this.playTaskIndex--;
    }

    return this.playTaskList[this.playTaskIndex];
  }

  initModel(model: string): boolean {
    this.playTaskList = [];
    this.playTaskIndex = 0;
    if (model === 'hard') {
      this.addPlayTask('start', 0);

      for (const seg of this.segments) {
        this.addPlayTask('play', seg.duration, seg.start, 1);
        this.addPlayTask('pause', seg.duration);
        this.addPlayTask('play', seg.duration, seg.start, 0.7);
        this.addPlayTask('pause', seg.duration);
        this.addPlayTask('play', seg.duration, seg.start, 1, seg.text);
        this.addPlayTask('pause', seg.duration * 0.5);
        // this.addPlayTask('play', seg.duration, seg.start, 0.75);
        // this.addPlayTask('pause', seg.duration * 0.8);
      }
      this.addPlayTask('play', this.duration, 0, 1);
      this.addPlayTask('end', 0);
    } else if (model === 'easy') {
      this.addPlayTask('start', 0);

      for (const seg of this.segments) {
        this.addPlayTask('play', seg.duration, seg.start, 0.7);
        this.addPlayTask('pause', seg.duration * 0.5);
        this.addPlayTask('play', seg.duration, seg.start, 0.7, seg.text);
        this.addPlayTask('pause', seg.duration);
        this.addPlayTask('play', seg.duration, seg.start, 1);
        this.addPlayTask('pause', seg.duration * 0.5);
      }
      this.addPlayTask('play', this.duration, 0, 1);
      this.addPlayTask('end', 0);
    }
    // console.log(this.playTaskList, model);
    return true;
  }
}
