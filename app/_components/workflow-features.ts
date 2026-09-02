import { FileDiff, SquareTerminal, type LucideIcon } from 'lucide-react'
import type { ComponentType } from 'react'
import { CopyDiffMockup } from '@/app/_components/copy-diff-mockup'
import { PipelineLogMockup } from '@/app/_components/pipeline-log-mockup'

export type WorkflowFeature = Readonly<{
  id: string
  label: string
  description: string
  Icon: LucideIcon
  Mockup: ComponentType
}>

export const WORKFLOW_FEATURES: readonly WorkflowFeature[] = [
  {
    id: 'match',
    label: 'Match a template',
    description:
      'Your answers score against ten templates. The best fit wins, and the pipeline fills its copy slots, imagery, and brand tokens in under five minutes.',
    Icon: SquareTerminal,
    Mockup: PipelineLogMockup,
  },
  {
    id: 'copy',
    label: 'Generate copy',
    description:
      'Every headline and section is written for your brand, then validated against the slot rules before anything renders.',
    Icon: FileDiff,
    Mockup: CopyDiffMockup,
  },
]
