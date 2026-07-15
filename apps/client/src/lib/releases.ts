export interface Release {
  date: string;
  title: string;
  changes: readonly string[];
}

export const releases: readonly Release[] = [
  {
    date: "2026-07-15",
    title: "デプロイ版情報とリリースノートを追加",
    changes: [
      "フッターから、現在利用中のデプロイ版を確認できるようにしました。",
      "障害調査用のステータス API を追加しました。",
    ],
  },
];
