import { ToyRecommendation as ToyType } from '../types';
import GlassCard from './GlassCard';

interface Props {
  toy: ToyType;
}

const PRICE_LABELS: Record<string, string> = {
  budget: '₪50-150',
  mid: '₪150-350',
  premium: '₪350+'
};

export default function ToyRecommendationCard({ toy }: Props) {
  return (
    <GlassCard className="text-right">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h4 className="text-white font-medium text-base">{toy.name}</h4>
          <p className="text-white/50 text-sm mt-1">{toy.description}</p>
          <p className="text-sexy-fuchsia/70 text-xs mt-2">{toy.bestFor}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-white/30 text-xs">{PRICE_LABELS[toy.priceRange]}</span>
            <span className="text-yellow-400 text-xs">{'★'.repeat(Math.round(toy.rating))}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
