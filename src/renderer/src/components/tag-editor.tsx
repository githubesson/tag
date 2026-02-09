import { useState, useMemo } from 'react'
import { CalendarIcon, Disc3 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlbumArt } from '@/components/album-art'
import { AudioInfo } from '@/components/audio-info'
import type { AudioFileState } from '@/hooks/use-audio-files'
import type { AudioMetadata } from '../../../shared/types'

const MIXED = Symbol('mixed')
type MaybeField<T> = T | typeof MIXED

interface TagEditorProps {
  selectedFiles: AudioFileState[]
  onUpdateField: <K extends keyof AudioMetadata>(field: K, value: AudioMetadata[K]) => void
}

function getShared<T>(files: AudioFileState[], getter: (m: AudioMetadata) => T): MaybeField<T> {
  if (files.length === 0) return undefined as MaybeField<T>
  const first = getter(files[0].current)
  for (let i = 1; i < files.length; i++) {
    const val = getter(files[i].current)
    if (val !== first) return MIXED
  }
  return first
}

function TagField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string
  value: MaybeField<string | number | undefined>
  onChange: (value: string) => void
  type?: 'text' | 'number'
  placeholder?: string
}) {
  const isMixed = value === MIXED
  return (
    <div className="grid grid-cols-[7rem_1fr] items-center gap-2">
      <Label className="text-xs text-muted-foreground text-right">{label}</Label>
      <Input
        type={type}
        value={isMixed ? '' : (value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isMixed ? 'Multiple values' : placeholder}
        className={isMixed ? 'h-7 text-sm italic text-muted-foreground' : 'h-7 text-sm'}
      />
    </div>
  )
}

function TrackField({
  label,
  value,
  total,
  onChangeValue,
  onChangeTotal,
}: {
  label: string
  value: MaybeField<number | undefined>
  total: MaybeField<number | undefined>
  onChangeValue: (v: string) => void
  onChangeTotal: (v: string) => void
}) {
  const vMixed = value === MIXED
  const tMixed = total === MIXED
  return (
    <div className="grid grid-cols-[7rem_1fr] items-center gap-2">
      <Label className="text-xs text-muted-foreground text-right">{label}</Label>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          value={vMixed ? '' : (value ?? '')}
          onChange={(e) => onChangeValue(e.target.value)}
          placeholder={vMixed ? 'Mixed' : undefined}
          className={vMixed ? 'h-7 w-20 text-sm italic text-muted-foreground' : 'h-7 w-20 text-sm'}
          min={0}
        />
        <span className="text-muted-foreground text-xs">/</span>
        <Input
          type="number"
          value={tMixed ? '' : (total ?? '')}
          onChange={(e) => onChangeTotal(e.target.value)}
          placeholder={tMixed ? 'Mixed' : undefined}
          className={tMixed ? 'h-7 w-20 text-sm italic text-muted-foreground' : 'h-7 w-20 text-sm'}
          min={0}
        />
      </div>
    </div>
  )
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string
  value: MaybeField<number | undefined>
  onChange: (year: number | undefined) => void
}) {
  const [open, setOpen] = useState(false)
  const isMixed = value === MIXED
  const year = isMixed ? undefined : value

  const selected = year ? new Date(year, 0, 1) : undefined
  const defaultMonth = selected ?? new Date()

  return (
    <div className="grid grid-cols-[7rem_1fr] items-center gap-2">
      <Label className="text-xs text-muted-foreground text-right">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className={
                'h-7 w-36 justify-start text-sm font-normal' +
                (!year && !isMixed ? ' text-muted-foreground' : '') +
                (isMixed ? ' italic text-muted-foreground' : '')
              }
            />
          }
        >
          <CalendarIcon className="size-3.5" />
          {isMixed ? 'Multiple values' : year ? String(year) : 'Pick a year'}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={defaultMonth}
            onSelect={(date) => {
              if (date) {
                onChange(date.getFullYear())
              } else {
                onChange(undefined)
              }
              setOpen(false)
            }}
            captionLayout="dropdown"
            startMonth={new Date(1900, 0)}
            endMonth={new Date(2100, 0)}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

function TagTextarea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: MaybeField<string | undefined>
  onChange: (value: string) => void
  placeholder?: string
}) {
  const isMixed = value === MIXED
  return (
    <div className="grid grid-cols-[7rem_1fr] items-start gap-2">
      <Label className="mt-2 text-xs text-muted-foreground text-right">{label}</Label>
      <Textarea
        value={isMixed ? '' : (value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isMixed ? 'Multiple values' : placeholder}
        className={isMixed ? 'min-h-[4rem] text-sm italic text-muted-foreground' : 'min-h-[4rem] text-sm'}
      />
    </div>
  )
}

export function TagEditor({ selectedFiles, onUpdateField }: TagEditorProps) {
  const isMulti = selectedFiles.length > 1
  const file = selectedFiles.length === 1 ? selectedFiles[0] : null

  const shared = useMemo(() => {
    if (selectedFiles.length === 0) return null
    return {
      title: getShared(selectedFiles, (m) => m.title),
      artist: getShared(selectedFiles, (m) => m.artist),
      albumArtist: getShared(selectedFiles, (m) => m.albumArtist),
      album: getShared(selectedFiles, (m) => m.album),
      year: getShared(selectedFiles, (m) => m.year),
      track: getShared(selectedFiles, (m) => m.track),
      trackTotal: getShared(selectedFiles, (m) => m.trackTotal),
      disc: getShared(selectedFiles, (m) => m.disc),
      discTotal: getShared(selectedFiles, (m) => m.discTotal),
      genre: getShared(selectedFiles, (m) => m.genre),
      composer: getShared(selectedFiles, (m) => m.composer),
      comment: getShared(selectedFiles, (m) => m.comment),
      lyrics: getShared(selectedFiles, (m) => m.lyrics),
      albumArt: getShared(selectedFiles, (m) => m.albumArt),
    }
  }, [selectedFiles])

  if (!shared) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <Disc3 className="size-12 text-muted-foreground/30" />
        <div>
          <p className="text-sm text-muted-foreground">No file selected</p>
          <p className="text-xs text-muted-foreground/60">Open audio files to start editing tags</p>
        </div>
      </div>
    )
  }

  const parseNum = (v: string) => (v === '' ? undefined : Number(v))

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-6 p-4">
        {isMulti && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedFiles.length} files selected</Badge>
            <span className="text-xs text-muted-foreground">Changes apply to all selected files</span>
          </div>
        )}

        <div className="flex gap-4">
          <AlbumArt
            albumArt={shared.albumArt === MIXED ? undefined : (file ? file.current.albumArt : shared.albumArt)}
            isMixed={shared.albumArt === MIXED}
            onUpdate={(art) => onUpdateField('albumArt', art)}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <TagField
              label="Title"
              value={shared.title}
              onChange={(v) => onUpdateField('title', v || undefined)}
              placeholder="Track title"
            />
            <TagField
              label="Artist"
              value={shared.artist}
              onChange={(v) => onUpdateField('artist', v || undefined)}
              placeholder="Artist name"
            />
            <TagField
              label="Album Artist"
              value={shared.albumArtist}
              onChange={(v) => onUpdateField('albumArtist', v || undefined)}
              placeholder="Album artist"
            />
            <TagField
              label="Album"
              value={shared.album}
              onChange={(v) => onUpdateField('album', v || undefined)}
              placeholder="Album name"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <DateField
            label="Year"
            value={shared.year}
            onChange={(v) => onUpdateField('year', v)}
          />
          <TrackField
            label="Track"
            value={shared.track}
            total={shared.trackTotal}
            onChangeValue={(v) => onUpdateField('track', parseNum(v))}
            onChangeTotal={(v) => onUpdateField('trackTotal', parseNum(v))}
          />
          <TrackField
            label="Disc"
            value={shared.disc}
            total={shared.discTotal}
            onChangeValue={(v) => onUpdateField('disc', parseNum(v))}
            onChangeTotal={(v) => onUpdateField('discTotal', parseNum(v))}
          />
          <TagField
            label="Genre"
            value={shared.genre}
            onChange={(v) => onUpdateField('genre', v || undefined)}
            placeholder="Genre"
          />
          <TagField
            label="Composer"
            value={shared.composer}
            onChange={(v) => onUpdateField('composer', v || undefined)}
            placeholder="Composer"
          />
          <TagTextarea
            label="Comment"
            value={shared.comment}
            onChange={(v) => onUpdateField('comment', v || undefined)}
            placeholder="Comment"
          />
          <TagTextarea
            label="Lyrics"
            value={shared.lyrics}
            onChange={(v) => onUpdateField('lyrics', v || undefined)}
            placeholder="Lyrics"
          />
        </div>

        {!isMulti && file && <AudioInfo file={file.current} />}
      </div>
    </ScrollArea>
  )
}
